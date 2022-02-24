import * as BABYLON from '@babylonjs/core'
// import { mat4InvertCompat } from '../utils/mat4InvertCompat'
// import { getWorldQuaternionLite } from '../utils/math'
// import { Matrix4InverseCache } from '../utils/Matrix4InverseCache'
import { SpringBoneColliderMesh } from './colliderGroup'
import { SpringBoneParameters } from './parameters'
import { fromUnitVectorsToRef } from '../utils'
// based on
// https://github.com/vrm-c/vrm-specification/blob/084c4fd3a1/specification/0.0/schema/vrm.secondaryanimation.spring.schema.json

const IDENTITY_QUATERNION = Object.freeze(new BABYLON.Quaternion())

// Variable for temporary storage during calculation (Once an instance is created, the rest is reused)
const _v3A = new BABYLON.Vector3()
const _v3B = new BABYLON.Vector3()
const _v3C = new BABYLON.Vector3()
const _quatA = new BABYLON.Quaternion()
const _matA = new BABYLON.Matrix()
const _matB = new BABYLON.Matrix()

/**
 * A class represents a single spring bone of a VRM.
 * It should be managed by a [[VRMSpringBoneManager]].
 */
export class SpringBone {
  /**
   * Radius of the bone, will be used for collision.
   */
  public radius: number

  /**
   * Stiffness force of the bone. Increasing the value = faster convergence (feels "harder").
   * On UniVRM, its range on GUI is between `0.0` and `4.0` .
   */
  public stiffnessForce: number

  /**
   * Power of the gravity against this bone.
   * The "power" used in here is very far from scientific physics term...
   */
  public gravityPower: number

  /**
   * Direction of the gravity against this bone.
   * Usually it should be normalized.
   */
  public gravityDir: BABYLON.Vector3

  /**
   * Drag force of the bone. Increasing the value = less oscillation (feels "heavier").
   * 值越大，摇摆越少
   * On UniVRM, its range on GUI is between `0.0` and `1.0` .
   */
  public dragForce: number

  /**
   * Collider groups attached to this bone.
   */
  public colliders: SpringBoneColliderMesh[]

  /**
   * A BABYLON.TransformNode attached to this bone.
   */
  public readonly bone: BABYLON.TransformNode

  /**
   * Current position of child tail, in world unit. Will be used for verlet integration(verlet积分).
   */
  protected _currentTail = new BABYLON.Vector3()

  /**
   * Previous position of child tail, in world unit. Will be used for verlet integration.
   */
  protected _prevTail = new BABYLON.Vector3()

  /**
   * Next position of child tail, in world unit. Will be used for verlet integration.
   * Actually used only in [[update]] and it's kind of temporary variable.
   */
  protected _nextTail = new BABYLON.Vector3()

  /**
   * Initial axis of the bone, in local unit.
   */
  protected _boneAxis = new BABYLON.Vector3()

  /**
   * Length of the bone in relative space unit. Will be used for normalization in update loop.
   * It's same as local unit length unless there are scale transformation in world matrix.
   */
  protected _centerSpaceBoneLength: number

  /**
   * Position of this bone in relative space, kind of a temporary variable.
   */
  protected _centerSpacePosition = new BABYLON.Vector3()

  /**
   * This springbone will be calculated based on the space relative from this object.
   * If this is `null`, springbone will be calculated in world space.
   */
  protected _center: BABYLON.TransformNode | null = null

  public get center(): BABYLON.TransformNode | null {
    return this._center
  }
  public set center(center: BABYLON.TransformNode | null) {
    // convert tails to world space
    this._getMatrixCenterToWorld(_matA)

    // this._currentTail.applyMatrix4(_matA);
    // this._prevTail.applyMatrix4(_matA);
    // this._nextTail.applyMatrix4(_matA);
    BABYLON.Vector3.TransformCoordinatesToRef(this._currentTail, _matA, this._currentTail)
    BABYLON.Vector3.TransformCoordinatesToRef(this._prevTail, _matA, this._prevTail)
    BABYLON.Vector3.TransformCoordinatesToRef(this._nextTail, _matA, this._nextTail)

    // uninstall inverse cache
    // NOTE: check the change
    // if (this._center?.metadata?.inverseLocalMatrix) {
    //   this._center.metadata.inverseLocalMatrix = this._center._localMatrix
    //   delete this._center.metadata.inverseLocalMatrix
    // }

    // change the center
    this._center = center

    // install inverse cache
    // if (this._center) {
    //   if (!this._center.metadata.inverseLocalMatrix) {
    //     this._center._localMatrix.invertToRef(this._center.metadata.inverseLocalMatrix)
    //   }
    // }

    // convert tails to center space
    this._getMatrixWorldToCenter(_matA)

    BABYLON.Vector3.TransformCoordinatesToRef(this._currentTail, _matA, this._currentTail)
    BABYLON.Vector3.TransformCoordinatesToRef(this._prevTail, _matA, this._prevTail)
    BABYLON.Vector3.TransformCoordinatesToRef(this._nextTail, _matA, this._nextTail)

    // convert center space dependant state
    // _matA.multiply(this.bone.matrixWorld) // 🔥 ??
    _matA.multiplyToRef(this.bone.getWorldMatrix(), _matA)

    // this._centerSpacePosition.setFromMatrixPosition(_matA)
    // this._centerSpacePosition = BABYLON.Vector3.FromArray([_matA[12], _matA[13], _matA[14]])
    _matA.getTranslationToRef(this._centerSpacePosition)

    /// this._centerSpaceBoneLength = _v3A.copyFrom(this._initialLocalChildPosition).applyMatrix4(_matA).sub(this._centerSpacePosition).length()
    BABYLON.Vector3.TransformCoordinatesToRef(_v3A.copyFrom(this._initialLocalChildPosition), _matA, _v3A)
    this._centerSpaceBoneLength = _v3A.subtractToRef(this._centerSpacePosition, _v3A).length()
  }

  /**
   * Rotation of parent bone, in world unit.
   * We should update this constantly in [[update]].
   */
  private _parentWorldRotation = new BABYLON.Quaternion()

  /**
   * Initial state of the local matrix of the bone.
   */
  private _initialLocalMatrix = new BABYLON.Matrix()

  /**
   * Initial state of the rotation of the bone.
   */
  private _initialLocalRotation = new BABYLON.Quaternion()

  /**
   * Initial state of the position of its child.
   */
  private _initialLocalChildPosition = new BABYLON.Vector3()

  /**
   * Create a new VRMSpringBone.
   *
   * @param bone An Object3D that will be attached to this bone
   * @param params Several parameters related to behavior of the spring bone
   */
  constructor(bone: BABYLON.TransformNode, params: SpringBoneParameters = {}) {
    this.bone = bone // parent in uniVRM
    // this.bone.matrixAutoUpdate = false // Since it is calculated by update, automatic processing in three.js is unnecessary
    // TODO: Check wheather there is automatic processing in BJS
    // this.bone.freezeWorldMatrix()
    if (!this.bone.isWorldMatrixFrozen) {
      this.bone.freezeWorldMatrix()
    }

    this.radius = params.radius ?? 0.02
    this.stiffnessForce = params.stiffnessForce ?? 1.0
    this.gravityDir = params.gravityDir ? new BABYLON.Vector3().copyFrom(params.gravityDir) : new BABYLON.Vector3().set(0.0, -1.0, 0.0)
    this.gravityPower = params.gravityPower ?? 0.0
    this.dragForce = params.dragForce ?? 0.4
    this.colliders = params.colliders ?? []

    // this._centerSpacePosition.setFromMatrixPosition(this.bone.matrixWorld)
    const boneWorldMatrix = this.bone.getWorldMatrix()
    // same as this._centerSpacePosition = boneWorldMatrix.getTranslation()
    boneWorldMatrix.getTranslationToRef(this._centerSpacePosition)

    this._initialLocalMatrix.copyFrom(this.bone._localMatrix)
    this._initialLocalRotation.copyFrom(this.bone.rotationQuaternion as BABYLON.Quaternion)

    if (this.bone.getChildren().length === 0) {
      // The bone at the end. Since there is no child bone, "a little ahead of me" is the child bone
      // https://github.com/dwango/UniVRM/blob/master/Assets/VRM/UniVRM/Scripts/SpringBone/VRMSpringBone.cs#L246

      // vrm0 requires a 7cm fixed bone length for the final node in a chain - see https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_springBone-1.0-beta#about-spring-configuration
      this._initialLocalChildPosition.copyFrom(this.bone.position).normalize()
      this._initialLocalChildPosition.scaleToRef(0.07, this._initialLocalChildPosition)
    } else {
      const firstChild = this.bone.getChildTransformNodes()[0]
      this._initialLocalChildPosition.copyFrom(firstChild.position)
    }

    BABYLON.Vector3.TransformCoordinatesToRef(this._currentTail.copyFrom(this._initialLocalChildPosition), this.bone.getWorldMatrix(), this._currentTail)

    this._prevTail.copyFrom(this._currentTail)
    this._nextTail.copyFrom(this._currentTail)

    this._boneAxis.copyFrom(this._initialLocalChildPosition).normalize()

    BABYLON.Vector3.TransformCoordinatesToRef(_v3A.copyFrom(this._initialLocalChildPosition), this.bone.getWorldMatrix(), _v3A)
    this._centerSpaceBoneLength = _v3A.subtractToRef(this._centerSpacePosition, _v3A).length()

    this.center = params.center ?? null
  }

  // /**
  //  * Reset the state of this bone.
  //  * You might want to call [[VRMSpringBoneManager.reset]] instead.
  //  */
  // TODO: finish reset
  public reset(): void {
    this.bone?.rotationQuaternion?.copyFrom(this._initialLocalRotation)
    // We need to update its matrixWorld manually, since we tweaked the bone by our hand
    // this.bone.updateMatrix()
    // this.bone.matrixWorld.multiplyMatrices(this._getParentMatrixWorld(), this.bone.matrix)
    // this.bone.computeWorldMatrix(true)
    this.bone.freezeWorldMatrix(this.bone._localMatrix.multiply(this._getParentMatrixWorld()))
    // this._centerSpacePosition.setFromMatrixPosition(this.bone.matrixWorld)
    this.bone.getWorldMatrix().getTranslationToRef(this._centerSpacePosition)
    // Apply updated position to tail states
    // this.bone.localToWorld(this._currentTail.copyFrom(this._initialLocalChildPosition))
    BABYLON.Vector3.TransformCoordinatesToRef(this._currentTail.copyFrom(this._initialLocalChildPosition), this.bone.getWorldMatrix(), this._currentTail)
    this._prevTail.copyFrom(this._currentTail)
    this._nextTail.copyFrom(this._currentTail)
  }

  /**
   * Update the state of this bone.
   * You might want to call [[VRMSpringBoneManager.update]] instead.
   *
   * @param delta deltaTime
   */
  // TODO: finish update
  public update(delta: number): void {
    if (delta <= 0) return

    // The posture of the parent spring bone is constantly changing。Based on that, update your worldMatrix just before processing
    // this.bone.matrixWorld.multiplyMatrices(this._getParentMatrixWorld(), this.bone.matrix)

    // NOTE: multiplyMatrices(a,b) in 3JS is b x a
    this.bone.freezeWorldMatrix(this.bone._localMatrix.multiply(this._getParentMatrixWorld()))
    // this.bone.computeWorldMatrix(true)

    if (this.bone.parent) {
      // Since SpringBone is processed in order from the parent、
      // Parent matrixWorld fetches quaternion from worldMatrix on the assumption that it is up to date。
      // Although there are restrictions, this method is used instead of getWorldQuaternion because the calculation is small.。
      // getWorldQuaternionLite(this.bone.parent, this._parentWorldRotation)
      // TODO: the this._parentWorldRotation is not correct
      // skip the first param scale
      this.bone.parent.getWorldMatrix().decompose(undefined, this._parentWorldRotation)
    } else {
      this._parentWorldRotation.copyFrom(IDENTITY_QUATERNION)
    }

    // Get bone position in center space
    this._getMatrixWorldToCenter(_matA)
    // _matA.multiply(this.bone.matrixWorld) // 🔥 ??
    _matA.multiplyToRef(this.bone.getWorldMatrix(), _matA)
    // this._centerSpacePosition.setFromMatrixPosition(_matA)
    _matA.getTranslationToRef(this._centerSpacePosition)
    // Get parent position in center space
    this._getMatrixWorldToCenter(_matB)
    _matB.multiplyToRef(this._getParentMatrixWorld(), _matB)

    // several parameters
    const stiffness = this.stiffnessForce * delta
    const external = _v3B.copyFrom(this.gravityDir).scaleToRef(this.gravityPower * delta, _v3B)

    // Calculate the next position with verlet integral
    // this._nextTail
    //   .copyFrom(this._currentTail)
    //   .add(
    //     _v3A
    //       .copyFrom(this._currentTail)
    //       .subtract(this._prevTail)
    //       .scale(1 - this.dragForce)
    //   ) // Continue to move the previous frame (there is also attenuation)
    //   .add(_v3A.copyFrom(this._boneAxis).applyMatrix4(this._initialLocalMatrix).applyMatrix4(_matB).sub(this._centerSpacePosition).normalize().multiplyScalar(stiffness)) // Movement target of child bone by rotation of parent
    //   .add(external) // Amount of movement due to external force

    BABYLON.Vector3.TransformCoordinatesToRef(_v3A.copyFrom(this._boneAxis), this._initialLocalMatrix, _v3A)
    BABYLON.Vector3.TransformCoordinatesToRef(_v3A, _matB, _v3A)

    // Continue to move the previous frame (there is also attenuation)
    this._nextTail.copyFrom(this._currentTail).addToRef(
      _v3A
        .copyFrom(this._currentTail)
        .subtract(this._prevTail)
        .scale(1 - this.dragForce),
      this._nextTail
    )
    // Movement target of child bone by rotation of parent
    this._nextTail.addToRef(_v3A.subtract(this._centerSpacePosition).normalize().scale(stiffness), this._nextTail)
    // Amount of movement due to external force
    this._nextTail.addToRef(external, this._nextTail)

    // normalize bone length
    this._nextTail.subtractToRef(this._centerSpacePosition, this._nextTail)
    this._nextTail.normalize()
    this._nextTail.scaleToRef(this._centerSpaceBoneLength, this._nextTail)
    this._nextTail.addToRef(this._centerSpacePosition, this._nextTail)

    // Move with Collision
    this._collision(this._nextTail)

    this._prevTail.copyFrom(this._currentTail)
    this._currentTail.copyFrom(this._nextTail)

    // Apply rotation, convert vector3 thing into actual quaternion
    // Original UniVRM is doing world unit calculus at here but we're gonna do this on local unit
    // since Three.js is not good at world coordination stuff

    // const initialCenterSpaceMatrixInv = mat4InvertCompat(_matA.copyFrom(_matB.multiply(this._initialLocalMatrix)))
    // const applyRotation = _quatA.setFromUnitVectors(this._boneAxis, _v3A.copyFrom(this._nextTail).applyMatrix4(initialCenterSpaceMatrixInv).normalize())
    const initialCenterSpaceMatrixInv = new BABYLON.Matrix()
    _matA.copyFrom(_matB.multiplyToRef(this._initialLocalMatrix, _matB)).invertToRef(initialCenterSpaceMatrixInv)

    // IMPORTANT: the static method FromUnitVectorsToRef is not in below VERSION 5.0.0-alpha.4
    if (BABYLON.Quaternion.FromUnitVectorsToRef) {
      BABYLON.Quaternion.FromUnitVectorsToRef(this._boneAxis, BABYLON.Vector3.TransformCoordinates(_v3A.copyFrom(this._nextTail), initialCenterSpaceMatrixInv).normalize(), _quatA)
    } else {
      fromUnitVectorsToRef(this._boneAxis, BABYLON.Vector3.TransformCoordinates(_v3A.copyFrom(this._nextTail), initialCenterSpaceMatrixInv).normalize(), _quatA)
    }

    this.bone.rotationQuaternion?.copyFrom(this._initialLocalRotation).multiply(_quatA)

    // We need to update its matrixWorld manually, since we tweaked the bone by our hand

    // this.bone.updateMatrix()
    // this.bone.matrixWorld.multiplyMatrices(this._getParentMatrixWorld(), this.bone.matrix)

    // this.bone.computeWorldMatrix(true)
    this.bone.freezeWorldMatrix(this.bone._localMatrix.multiply(this._getParentMatrixWorld()))
  }

  /**
   * Do collision math against every colliders attached to this bone.
   *
   * @param tail The tail you want to process
   */

  private _collision(tail: BABYLON.Vector3): void {
    this.colliders.forEach(collider => {
      this._getMatrixWorldToCenter(_matA)
      _matA.multiplyToRef(collider.getWorldMatrix(), _matA)
      // const colliderCenterSpacePosition = _v3A.setFromMatrixPosition(_matA)
      _matA.getTranslationToRef(_v3A)
      const colliderCenterSpacePosition = _v3A
      // the bounding sphere is guaranteed to be exist by VRMSpringBoneImporter._createColliderMesh
      const colliderRadius = collider.getBoundingInfo().boundingSphere!.radius
      const r = this.radius + colliderRadius

      if (BABYLON.Vector3.DistanceSquared(tail, colliderCenterSpacePosition) <= r * r) {
        // hit. Extrude in the radial direction of the Collider
        // const normal = _v3B.subVectors(tail, colliderCenterSpacePosition).normalize()
        // const posFromCollider = _v3C.addVectors(colliderCenterSpacePosition, normal.multiplyScalar(r))
        tail.subtractToRef(colliderCenterSpacePosition, _v3B)
        const normal = _v3B.normalize()
        normal.scaleToRef(r, normal)
        colliderCenterSpacePosition.addToRef(normal, _v3C)

        const posFromCollider = _v3C

        // normalize bone length
        posFromCollider.subtractToRef(this._centerSpacePosition, posFromCollider)
        posFromCollider.normalize()
        posFromCollider.scaleToRef(this._centerSpaceBoneLength, posFromCollider)
        posFromCollider.addToRef(this._centerSpacePosition, posFromCollider)
        tail.copyFrom(posFromCollider)
      }
    })
  }

  /**
   * Create a matrix that converts center space into world space.
   * @param target Target matrix
   */
  private _getMatrixCenterToWorld(target: BABYLON.Matrix): BABYLON.Matrix {
    if (this._center) {
      target.copyFrom(this._center.getWorldMatrix())
    } else {
      target.copyFrom(BABYLON.Matrix.Identity())
    }

    return target
  }

  /**
   * Create a matrix that converts world space into center space.
   * @param target Target matrix
   */
  private _getMatrixWorldToCenter(target: BABYLON.Matrix): BABYLON.Matrix {
    if (this._center) {
      // userdata store the worldMatrix, and return the inverse matrix to target without change the worldMatrix
      // target.copyFrom((this._center.userdata.inverseCacheProxy as Matrix4InverseCache).inverse)
      this._center.getWorldMatrix().invertToRef(target)
    } else {
      target.copyFrom(BABYLON.Matrix.Identity())
    }

    return target
  }

  /**
   * Returns the world matrix of its parent object.
   */
  private _getParentMatrixWorld(): BABYLON.Matrix {
    return this.bone.parent ? this.bone.parent.getWorldMatrix() : BABYLON.Matrix.Identity()
  }
}

export * from './colliderGroup'
export * from './importer'
export * from './manager'
export * from './parameters'

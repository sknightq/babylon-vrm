import * as BABYLON from '@babylonjs/core'
import { FirstPerson } from '../firstPerson'
import { multiplyQuaternionByVectorToRef } from '../utils'
// import { getWorldQuaternionLite } from '../utils/math';
// import { quatInvertCompat } from '../utils/quatInvertCompat';
import { LookAtApplyer } from './applyer'

const VECTOR3_FRONT = Object.freeze(new BABYLON.Vector3(0.0, 0.0, -1.0))

const _v3A = new BABYLON.Vector3()
const _v3B = new BABYLON.Vector3()
const _v3C = new BABYLON.Vector3()
const _quat = new BABYLON.Quaternion()

/**
 * A class represents look at of a VRM.
 */
export class LookAtHead {
  public static readonly EULER_ORDER = 'YXZ' // yaw-pitch-roll

  /**
   * Associated [[VRMFirstPerson]], will be used for direction calculation.
   */
  public readonly firstPerson: FirstPerson

  /**
   * Associated [[VRMLookAtApplyer]], its look at direction will be applied to the model using this applier.
   */
  public readonly applyer?: LookAtApplyer

  /**
   * If this is true, its look at direction will be updated automatically by calling [[VRMLookAtHead.update]] (which is called from [[VRM.update]]).
   *
   * See also: [[VRMLookAtHead.target]]
   */
  public autoUpdate = true

  /**
   * The target object of the look at.
   * Note that it does not make any sense if [[VRMLookAtHead.autoUpdate]] is disabled.
   */
  public target?: BABYLON.TransformNode

  protected _euler: BABYLON.Vector3 = new BABYLON.Vector3(0.0, 0.0, 0.0)

  /**
   * Create a new VRMLookAtHead.
   *
   * @param firstPerson A [[VRMFirstPerson]] that will be associated with this new VRMLookAtHead
   * @param applyer A [[VRMLookAtApplyer]] that will be associated with this new VRMLookAtHead
   */
  constructor(firstPerson: FirstPerson, applyer?: LookAtApplyer) {
    this.firstPerson = firstPerson
    this.applyer = applyer
  }

  /**
   * Get its look at direction in world coordinate.
   *
   * @param target A target `BABYLON.Vector3`
   */
  public getLookAtWorldDirection(target: BABYLON.Vector3): BABYLON.Vector3 {
    // const rot = getWorldQuaternionLite(this.firstPerson.firstPersonBone, _quat);
    // return target.copy(VECTOR3_FRONT).applyEuler(this._euler).applyQuaternion(rot);
    this.firstPerson.firstPersonBone.getWorldMatrix().decompose(...[,], _quat)
    const quaternionElur = BABYLON.Quaternion.FromEulerVector(this._euler)
    multiplyQuaternionByVectorToRef(quaternionElur, target.copyFrom(VECTOR3_FRONT), target)
    multiplyQuaternionByVectorToRef(_quat, target, target)
    return target
  }

  /**
   * Set its look at position.
   * Note that its result will be instantly overwritten if [[VRMLookAtHead.autoUpdate]] is enabled.
   *
   * @param position A target position
   */
  public lookAt(position: BABYLON.Vector3): void {
    this._calcEuler(this._euler, position)

    if (this.applyer) {
      this.applyer.lookAt(this._euler)
    }
  }

  /**
   * Update the VRMLookAtHead.
   * If [[VRMLookAtHead.autoUpdate]] is disabled, it will do nothing.
   *
   * @param delta deltaTime
   */
  public update(delta: number): void {
    if (delta <= 0) {
      return
    }
    if (this.target && this.autoUpdate) {
      _v3A.copyFrom(this.target.getAbsolutePosition())
      this.lookAt(_v3A)

      if (this.applyer) {
        this.applyer.lookAt(this._euler)
      }
    }
  }

  protected _calcEuler(target: BABYLON.Vector3, position: BABYLON.Vector3): BABYLON.Vector3 {
    const headPosition = this.firstPerson.getFirstPersonWorldPosition(_v3B)

    // Look at direction in world coordinate
    const lookAtDir = _v3C.copyFrom(position).subtract(headPosition).normalize()

    // Transform the direction into local coordinate from the first person bone
    // lookAtDir.applyQuaternion(quatInvertCompat(getWorldQuaternionLite(this.firstPerson.firstPersonBone, _quat)));
    // TODO: quaternion * lookAtDir
    this.firstPerson.firstPersonBone.getWorldMatrix().decompose(...[,], _quat)
    BABYLON.Quaternion.InverseToRef(_quat, _quat)
    multiplyQuaternionByVectorToRef(_quat, lookAtDir, lookAtDir)

    // convert the direction into euler
    target.x = Math.atan2(lookAtDir.y, Math.sqrt(lookAtDir.x * lookAtDir.x + lookAtDir.z * lookAtDir.z))
    target.y = Math.atan2(-lookAtDir.x, -lookAtDir.z)

    return target
  }
}

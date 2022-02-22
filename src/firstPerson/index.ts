import * as BABYLON from '@babylonjs/core'
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0'
import { GLTFNode, GLTFPrimitive } from '../types'
import { multiplyQuaternionByVectorToRef } from '../utils'
// import { getWorldQuaternionLite } from '../utils/math';

const VECTOR3_FRONT = Object.freeze(new BABYLON.Vector3(0.0, 0.0, -1.0))

const _quat = new BABYLON.Quaternion()

enum FirstPersonFlag {
  Auto,
  Both,
  ThirdPersonOnly,
  FirstPersonOnly
}

/**
 * This class represents a single [`meshAnnotation`] entry.
 * Each mesh will be assigned to specified layer when you call [[VRMFirstPerson.setup]].
 * firstPersonFlag @see https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm-1.0-beta/schema/VRMC_vrm.firstPerson.meshAnnotation.schema.json
 */
export class RendererFirstPersonFlags {
  private static _parseFirstPersonFlag(firstPersonFlag: string | undefined): FirstPersonFlag {
    switch (firstPersonFlag) {
      case 'Both':
        return FirstPersonFlag.Both
      case 'ThirdPersonOnly':
        return FirstPersonFlag.ThirdPersonOnly
      case 'FirstPersonOnly':
        return FirstPersonFlag.FirstPersonOnly
      default:
        return FirstPersonFlag.Auto
    }
  }

  /**
   * A [[FirstPersonFlag]] of the annotation entry.
   */
  public firstPersonFlag: FirstPersonFlag

  /**
   * A mesh primitives of the annotation entry.
   */
  public primitives: GLTFPrimitive[]

  /**
   * Create a new mesh annotation.
   *
   * @param firstPersonFlag A [[FirstPersonFlag]] of the annotation entry
   * @param node A node of the annotation entry.
   */
  constructor(firstPersonFlag: string | undefined, primitives: GLTFPrimitive[]) {
    this.firstPersonFlag = RendererFirstPersonFlags._parseFirstPersonFlag(firstPersonFlag)
    this.primitives = primitives
  }
}

export class FirstPerson {
  /**
   * A default camera layer for `Both` layer.
   * mesh.layerMask & camera.layer !== 0 will be rendered
   *
   * If camera layerMask is set fisrtPerson (0x10000000),
   * Then the mesh thirdPerson (0x20000000) will be not rendered
   * because of 0x10000000 & 0x20000000 === 0
   * @see https://doc.babylonjs.com/divingDeeper/scene/layermask
   *
   * However 3JS controls the layer mask with per bit (total is 32)
   * EX. 0101 in 3JS is layers.enable(31) and layers.enable(29)
   * @see https://threejs.org/docs/?q=Layer#api/zh/core/Layers
   *
   * @see [[getBothLayer]]
   */
  private static readonly _DEFAULT_BOTH_LAYER = 0x0fffffff
  /**
   * A default camera layer for `FirstPersonOnly` layer.
   *
   * @see [[getFirstPersonOnlyLayer]]
   */
  private static readonly _DEFAULT_FIRSTPERSON_ONLY_LAYER = 0x10000000

  /**
   * A default camera layer for `ThirdPersonOnly` layer.
   *
   * @see [[getThirdPersonOnlyLayer]]
   */
  private static readonly _DEFAULT_THIRDPERSON_ONLY_LAYER = 0x20000000

  private readonly _firstPersonBone: GLTFNode
  private readonly _meshAnnotations: RendererFirstPersonFlags[] = []
  private readonly _firstPersonBoneOffset: BABYLON.Vector3
  // Cannot get the bone hierarchy in primitive->skeleton->bone
  // but can get in transformNodes
  private readonly _transformNodes: GLTFNode[]

  private _firstPersonOnlyLayer = FirstPerson._DEFAULT_FIRSTPERSON_ONLY_LAYER
  private _thirdPersonOnlyLayer = FirstPerson._DEFAULT_THIRDPERSON_ONLY_LAYER
  private _bothLayer = FirstPerson._DEFAULT_BOTH_LAYER
  private _initialized = false

  /**
   * Create a new VRMFirstPerson object.
   *
   * @param firstPersonBone A first person bone
   * @param firstPersonBoneOffset An offset from the specified first person bone
   * @param meshAnnotations A renderer settings. See the description of [[RendererFirstPersonFlags]] for more info
   */
  constructor(firstPersonBone: GLTFNode, firstPersonBoneOffset: BABYLON.Vector3, meshAnnotations: RendererFirstPersonFlags[], loader: GLTFLoader) {
    this._firstPersonBone = firstPersonBone
    this._firstPersonBoneOffset = firstPersonBoneOffset
    this._meshAnnotations = meshAnnotations
    this._transformNodes = loader.babylonScene.transformNodes
  }

  public get firstPersonBone(): GLTFNode {
    return this._firstPersonBone
  }

  public get meshAnnotations(): RendererFirstPersonFlags[] {
    return this._meshAnnotations
  }

  public getFirstPersonWorldDirection(target: BABYLON.Vector3): BABYLON.Vector3 {
    // return target.copyFrom(VECTOR3_FRONT).applyQuaternion(getWorldQuaternionLite(this._firstPersonBone, _quat));
    this._firstPersonBone.getWorldMatrix().decompose(...[,], _quat)
    target.copyFrom(VECTOR3_FRONT)
    multiplyQuaternionByVectorToRef(_quat, target, target)
    return target
  }

  /**
   * A camera layer represents `FirstPersonOnly` layer.
   * Note that **you must call [[setup]] first before you use the layer feature** or it does not work properly.
   *
   * The value is [[DEFAULT_FIRSTPERSON_ONLY_LAYER]] by default but you can change the layer by specifying via [[setup]] if you prefer.
   *
   * @see https://vrm.dev/en/univrm/api/univrm_use_firstperson/
   * @see https://threejs.org/docs/#api/en/core/Layers
   */
  public get firstPersonOnlyLayer(): number {
    return this._firstPersonOnlyLayer
  }

  /**
   * A camera layer represents `ThirdPersonOnly` layer.
   * Note that **you must call [[setup]] first before you use the layer feature** or it does not work properly.
   *
   * The value is [[DEFAULT_THIRDPERSON_ONLY_LAYER]] by default but you can change the layer by specifying via [[setup]] if you prefer.
   *
   * @see https://vrm.dev/en/univrm/api/univrm_use_firstperson/
   * @see https://threejs.org/docs/#api/en/core/Layers
   */
  public get thirdPersonOnlyLayer(): number {
    return this._thirdPersonOnlyLayer
  }

  public get bothLayer(): number {
    return this._bothLayer
  }

  public getFirstPersonBoneOffset(target: BABYLON.Vector3): BABYLON.Vector3 {
    return target.copyFrom(this._firstPersonBoneOffset)
  }

  /**
   * Get current world position of the first person.
   * The position takes [[FirstPersonBone]] and [[FirstPersonOffset]] into account.
   *
   * @param v3 target
   * @returns Current world position of the first person
   */
  public getFirstPersonWorldPosition(v3: BABYLON.Vector3): BABYLON.Vector3 {
    // UniVRM#VRMFirstPersonEditor
    // var worldOffset = head.localToWorldMatrix.MultiplyPoint(component.FirstPersonOffset);
    const offset = this._firstPersonBoneOffset
    const v = new BABYLON.Vector3(offset.x, offset.y, offset.z)
    v.copyFrom(BABYLON.Vector3.TransformCoordinates(v, this._firstPersonBone.getWorldMatrix()))
    return v3.set(v.x, v.y, v.z)
  }

  /**
   * In this method, it assigns layers for every meshes based on mesh annotations.
   * You must call this method first before you use the layer feature.
   *
   * This is an equivalent of [VRMFirstPerson.Setup](https://github.com/vrm-c/UniVRM/blob/master/Assets/VRM/UniVRM/Scripts/FirstPerson/VRMFirstPerson.cs) of the UniVRM.
   *
   * The `cameraLayer` parameter specifies which layer will be assigned for `FirstPersonOnly` / `ThirdPersonOnly`.
   * In UniVRM, we specified those by naming each desired layer as `FIRSTPERSON_ONLY_LAYER` / `THIRDPERSON_ONLY_LAYER`
   * but we are going to specify these layers at here since we are unable to name layers in Three.js.
   *
   * @param cameraLayer Specify which layer will be for `FirstPersonOnly` / `ThirdPersonOnly`.
   */
  public setup({ firstPersonOnlyLayer = FirstPerson._DEFAULT_FIRSTPERSON_ONLY_LAYER, thirdPersonOnlyLayer = FirstPerson._DEFAULT_THIRDPERSON_ONLY_LAYER } = {}): void {
    if (this._initialized) {
      return
    }
    this._initialized = true
    this._firstPersonOnlyLayer = firstPersonOnlyLayer
    this._thirdPersonOnlyLayer = thirdPersonOnlyLayer

    this._meshAnnotations.forEach(item => {
      if (item.firstPersonFlag === FirstPersonFlag.FirstPersonOnly) {
        item.primitives.forEach(primitive => {
          // primitive.layers.set(this._firstPersonOnlyLayer);
          primitive.layerMask = this._firstPersonOnlyLayer
        })
      } else if (item.firstPersonFlag === FirstPersonFlag.ThirdPersonOnly) {
        item.primitives.forEach(primitive => {
          // primitive.layers.set(this._thirdPersonOnlyLayer);
          primitive.layerMask = this._firstPersonOnlyLayer
        })
      } else if (item.firstPersonFlag === FirstPersonFlag.Auto) {
        // NOTE: create a headless model if the mesh is not set the firstPerson flag
        this._createHeadlessModel(item.primitives)
      }
    })
  }

  private _excludeTriangles(triangles: number[], bws: number[][], skinIndex: number[][], exclude: number[]): number {
    let count = 0
    if (bws != null && bws.length > 0) {
      for (let i = 0; i < triangles.length; i += 3) {
        const a = triangles[i]
        const b = triangles[i + 1]
        const c = triangles[i + 2]
        const bw0 = bws[a]
        const skin0 = skinIndex[a]

        if (bw0[0] > 0 && exclude.includes(skin0[0])) continue
        if (bw0[1] > 0 && exclude.includes(skin0[1])) continue
        if (bw0[2] > 0 && exclude.includes(skin0[2])) continue
        if (bw0[3] > 0 && exclude.includes(skin0[3])) continue

        const bw1 = bws[b]
        const skin1 = skinIndex[b]
        if (bw1[0] > 0 && exclude.includes(skin1[0])) continue
        if (bw1[1] > 0 && exclude.includes(skin1[1])) continue
        if (bw1[2] > 0 && exclude.includes(skin1[2])) continue
        if (bw1[3] > 0 && exclude.includes(skin1[3])) continue

        const bw2 = bws[c]
        const skin2 = skinIndex[c]
        if (bw2[0] > 0 && exclude.includes(skin2[0])) continue
        if (bw2[1] > 0 && exclude.includes(skin2[1])) continue
        if (bw2[2] > 0 && exclude.includes(skin2[2])) continue
        if (bw2[3] > 0 && exclude.includes(skin2[3])) continue

        triangles[count++] = a
        triangles[count++] = b
        triangles[count++] = c
      }
    }
    return count
  }
  /**
   * Frustum culling in BJS
   * @see https://doc.babylonjs.com/divingDeeper/scene/optimize_your_scene#changing-mesh-culling-strategy
   */
  private _createErasedMesh(src: BABYLON.Mesh, erasingBonesIndex: number[]): BABYLON.Mesh {
    // const dst = new THREE.SkinnedMesh(src.geometry.clone(), src.material);
    const dst = new BABYLON.Mesh(`${src.name}(erase)`, ...[,,], src)
    dst.material = src.material
    dst.name = `${src.name}(erase)`
    // TODO: using the BJS method about frustum culling
    // dst.frustumCulled = src.frustumCulled
    // dst.layers.set(this._firstPersonOnlyLayer);
    dst.layerMask = this._firstPersonOnlyLayer
    const geometry = dst.geometry

    // const skinIndexAttr = geometry.getAttribute('skinIndex').array
    const skinIndexAttr = geometry?.getIndices() as BABYLON.IndicesArray
    const skinIndex = []
    for (let i = 0; i < skinIndexAttr.length; i += 4) {
      skinIndex.push([skinIndexAttr[i], skinIndexAttr[i + 1], skinIndexAttr[i + 2], skinIndexAttr[i + 3]])
    }

    // const skinWeightAttr = geometry.getAttribute('skinWeight').array
    // const skinWeight = []
    // for (let i = 0; i < skinWeightAttr.length; i += 4) {
    //   skinWeight.push([skinWeightAttr[i], skinWeightAttr[i + 1], skinWeightAttr[i + 2], skinWeightAttr[i + 3]])
    // }

    // const index = geometry.getIndex()
    // if (!index) {
    //   throw new Error("The geometry doesn't have an index buffer")
    // }
    // const oldTriangles: number[] = Array.from(index.array)

    // const count = this._excludeTriangles(oldTriangles, skinWeight, skinIndex, erasingBonesIndex)
    // const newTriangle: number[] = []
    // for (let i = 0; i < count; i++) {
    //   newTriangle[i] = oldTriangles[i]
    // }
    // geometry.setIndex(newTriangle)

    // mtoon material includes onBeforeRender. this is unsupported at SkinnedMesh#clone
    // if (src.onBeforeRender) {
    //   dst.onBeforeRender = src.onBeforeRender
    // }
    // dst.bind(new BABYLON.Skeleton(src.skeleton.bones, src.skeleton.boneInverses), new BABYLON.Matrix())
    return dst
  }
  /**
   *
   */
  private _createHeadlessModelForSkinnedMesh(parent: BABYLON.TransformNode, mesh: BABYLON.Mesh): void {
    const eraseBoneIndexes: number[] = []
    // mesh.skeleton?.bones.forEach((bone, index) => {
    //   if (this._isEraseTarget(bone)) {
    //     eraseBoneIndexes.push(index)
    //   }
    // })
    this._transformNodes.forEach((n, index) => {
      if (this._isEraseTarget(n)) {
        eraseBoneIndexes.push(index)
      }
    })

    // Unlike UniVRM we don't copy mesh if no invisible bone was found
    if (!eraseBoneIndexes.length) {
      // NOTE: visible in both camare layer)
      mesh.layerMask = this._bothLayer
      return
    }
    mesh.layerMask = this._thirdPersonOnlyLayer
    const newMesh = this._createErasedMesh(mesh, eraseBoneIndexes)
    // parent.add(newMesh);
    newMesh.parent = parent
  }

  private _createHeadlessModel(primitives: GLTFPrimitive[]): void {
    primitives.forEach(primitive => {
      if (primitive._isMesh) {
        const skinnedMesh = primitive as BABYLON.Mesh
        this._createHeadlessModelForSkinnedMesh(skinnedMesh.parent! as BABYLON.TransformNode, skinnedMesh)
      } else {
        if (this._isEraseTarget(primitive)) {
          primitive.layerMask = this._thirdPersonOnlyLayer
        }
      }
    })
  }

  /**
   * It just checks whether the node or its parent is the first person bone or not.
   * @param bone The target bone
   */
  private _isEraseTarget(bone: GLTFNode | BABYLON.Node): boolean {
    if (bone === this._firstPersonBone) {
      return true
    } else if (!bone.parent) {
      return false
    } else {
      return this._isEraseTarget(bone.parent)
    }
  }
}

export * from './importer'

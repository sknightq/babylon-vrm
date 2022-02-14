import * as BABYLON from '@babylonjs/core'
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';
import { ExpressionProxy } from './expression/index'
import { FirstPerson } from './firstPerson/index'
import { Humanoid } from './humanoid/index'
import { LookAtHead } from './lookAt/index'
import { Meta } from './meta/index'
import { SpringBoneManager } from './springBone/index'
import { deepDispose } from './utils/disposer'
import { Importer, ImporterOptions } from './importer'

/**
 * Parameters for a [[VRM]] class.
 */
export interface Parameters {
  scene: BABYLON.Scene // same as THREE.Scene | THREE.Group in ThreeJS 
  humanoid?: Humanoid
  expressionProxy?: ExpressionProxy
  firstPerson?: FirstPerson
  lookAt?: LookAtHead
  materials?: BABYLON.Material[];
  springBoneManager?: SpringBoneManager
  meta?: Meta
}
/**
 * A class that represents a single VRM model.
 * See the documentation of [[VRM.from]] for the most basic use of VRM.
 */
export class VRM {
  /**
   * Create a new VRM from a parsed result of GLTF taken from GLTFLoader.
   * It's probably a thing what you want to get started with VRMs.
   *
   * @example Most basic use of VRM
   * ```
   * const vrmScene = await BABYLON.SceneLoader.AppendAsync('/  models/', 'boy.vrm', scene)
        vrmScene.onBeforeRenderObservable.addOnce((s)=>{
          const vrm = s.metadata.vrm[0]
        })
   * ```
   *
   * @param loader GLTFLoader
   * @param options Options that will be used in importer
   */
  public static async from(loader: GLTFLoader, options: ImporterOptions = {}): Promise<VRM> {
    const importer = new Importer(options)
    return await importer.import(loader)
  }
  /**
   * BABYLON.Scene that contains the entire VRM.
   */
  public readonly scene: BABYLON.Scene
  /**
   * Specification: https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm-1.0-beta/humanoid.md
   * Contains [[VRMHumanoid]] of the VRM.
   * You can control each bones using [[VRMHumanoid.getBoneNode]].
   *
   * @TODO Add a link to VRM spec
   */
  public readonly humanoid?: Humanoid

  /**
   * Specification: https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm-1.0-beta/expressions.md
   * Contains [[VRMBlendShapeProxy]] of the VRM.
   * You might want to control these facial expressions via [[VRMBlendShapeProxy.setValue]].
   */
  // TODO: rename the blendShape to expression
  public readonly expressionProxy?: ExpressionProxy

  /**
   * Specification: https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm-1.0-beta/firstPerson.md
   * Contains [[VRMFirstPerson]] of the VRM.
   * You can use various feature of the firstPerson field.
   */
  public readonly firstPerson?: FirstPerson

  /**
   * Specification: https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm-1.0-beta/lookAt.md
   * Contains [[VRMLookAtHead]] of the VRM.
   * You might want to use [[VRMLookAtHead.target]] to control the eye direction of your VRMs.
   */
  public readonly lookAt?: LookAtHead

  /**
   * Contains materials of the VRM.
   * `updateVRMMaterials` method of these materials will be called via its [[VRM.update]] method.
   */
  public readonly materials?: BABYLON.Material[];

  /**
   * Specification: https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm-1.0-beta/meta.md
   * Contains meta fields of the VRM.
   * You might want to refer these license fields before use your VRMs.
   */
  public readonly meta?: Meta

  /**
   * A [[VRMSpringBoneManager]] manipulates all spring bones attached on the VRM.
   * Usually you don't have to care about this property.
   */
  public readonly springBoneManager?: SpringBoneManager

  /**
   * Create a new VRM instance.
   *
   * @param params [[VRMParameters]] that represents components of the VRM
   */
  public constructor(params: Parameters) {
    this.scene = params.scene
    this.humanoid = params.humanoid
    this.expressionProxy = params.expressionProxy
    this.firstPerson = params.firstPerson
    this.lookAt = params.lookAt
    this.materials = params.materials;
    this.springBoneManager = params.springBoneManager
    this.meta = params.meta
  }

  /**
   * **You need to call this on your update loop.**
   *
   * This function updates every VRM components.
   *
   * @param delta deltaTime
   */
  public update(delta: number): void {
    if (this.lookAt) {
      this.lookAt.update(delta)
    }

    if (this.expressionProxy) {
      this.expressionProxy.update()
    }

    if (this.springBoneManager) {
      this.springBoneManager.lateUpdate(delta)
    }

    if (this.materials) {
      this.materials.forEach((material: any) => {
        if (material.updateVRMMaterials) {
          material.updateVRMMaterials(delta);
        }
      });
    }
  }

  // /**
  //  * Dispose everything about the VRM instance.
  //  */
  public dispose(): void {
    const scene = this.scene
    if (scene) {
      // TODO: check if the dispose method is worked
      scene.rootNodes.forEach(node => deepDispose(node))
    }

    this.meta?.texture?.dispose()
  }
}

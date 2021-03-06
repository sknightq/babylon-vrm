import * as BABYLON from '@babylonjs/core'
import { GLTFLoader, INode } from '@babylonjs/loaders/glTF/2.0'
import { Humanoid } from '../humanoid'
import { GLTFNode, VRMSchema } from '../types'
import { gltfExtractPrimitivesFromNodes, gltfExtractPrimitivesFromNode } from '../utils/gltfExtractPrimitivesFromNode'
import { FirstPerson, RendererFirstPersonFlags } from './index'

/**
 * An importer that imports a [[VRMFirstPerson]] from a VRM extension of a GLTF.
 */
export class FirstPersonImporter {
  /**
   * Import a [[VRMFirstPerson]] from a VRM.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   * @param humanoid A [[VRMHumanoid]] instance that represents the VRM
   */
  public async import(loader: GLTFLoader, humanoid: Humanoid): Promise<FirstPerson | null> {
    const vrmExt: VRMSchema.VRM | undefined = loader.gltf.extensions?.VRM
    if (!vrmExt) {
      return null
    }

    const schemaFirstPerson: VRMSchema.FirstPerson | undefined = vrmExt.firstPerson
    if (!schemaFirstPerson) {
      return null
    }

    const firstPersonBoneIndex = schemaFirstPerson.firstPersonBone

    let firstPersonBone: GLTFNode | null
    if (firstPersonBoneIndex === undefined || firstPersonBoneIndex === -1) {
      firstPersonBone = humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head)
    } else {
      // firstPersonBone = loader.babylonScene.transformNodes[firstPersonBoneIndex]
      firstPersonBone = (loader.gltf.nodes as INode[])[firstPersonBoneIndex]._babylonTransformNode as BABYLON.TransformNode
      const testMap = await gltfExtractPrimitivesFromNode(loader, firstPersonBoneIndex)
      console.log(testMap)
    }

    if (!firstPersonBone) {
      console.warn('FirstPersonImporter: Could not find firstPersonBone of the VRM')
      return null
    }

    const firstPersonBoneOffset = schemaFirstPerson.firstPersonBoneOffset
      ? new BABYLON.Vector3(
          schemaFirstPerson.firstPersonBoneOffset.x,
          schemaFirstPerson.firstPersonBoneOffset.y,
          // IMPORTANT: VRM 0.0 uses left-handed y-up (same as BJS)
          schemaFirstPerson.firstPersonBoneOffset.z!
        )
      : new BABYLON.Vector3(0.0, 0.06, 0.0) // fallback, taken from UniVRM implementation

    const meshAnnotations: RendererFirstPersonFlags[] = []
    const nodePrimitivesMap = await gltfExtractPrimitivesFromNodes(loader)

    Array.from(nodePrimitivesMap.entries()).forEach(([nodeIndex, primitives]) => {
      const schemaNode: INode = (loader.gltf.nodes as INode[])[nodeIndex]

      const flag = schemaFirstPerson.meshAnnotations ? schemaFirstPerson.meshAnnotations.find(a => a.mesh === schemaNode.mesh) : undefined
      meshAnnotations.push(new RendererFirstPersonFlags(flag?.firstPersonFlag, primitives))
    })

    return new FirstPerson(firstPersonBone, firstPersonBoneOffset, meshAnnotations)
  }
}

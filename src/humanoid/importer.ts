import * as BABYLON from '@babylonjs/core';
import { GLTFLoader, IGLTF, INode } from '@babylonjs/loaders/glTF/2.0';
import { VRMSchema } from '../types';
import { HumanBone } from './humanBone';
import { HumanBoneArray } from './humanBoneArray';
import { HumanDescription } from './humanDescription';
import { Humanoid } from './index';

/**
 * An importer that imports a [[VRMHumanoid]] from a VRM extension of a GLTF.
 */
export class HumanoidImporter {
  /**
   * Import a [[VRMHumanoid]] from a VRM.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   */
  public async import(loader: GLTFLoader): Promise<Humanoid | null> {
    // const vrmExt: VRMSchema.VRM | undefined = gltf.parser.json.extensions?.VRM;
    const vrmExt: VRMSchema.VRM | undefined = loader.gltf.extensions?.VRM;
    if (!vrmExt) {
      return null;
    }

    const schemaHumanoid: VRMSchema.Humanoid | undefined = vrmExt.humanoid;
    if (!schemaHumanoid) {
      return null;
    }

    const humanBoneArray: HumanBoneArray = [];
    if (schemaHumanoid.humanBones) {
      await Promise.all(
        schemaHumanoid.humanBones.map(async (bone) => {
          if (!bone.bone || bone.node == null) {
            return;
          }

          // const node = await gltf.parser.getDependency('node', bone.node);
          const node = loader.babylonScene.transformNodes[bone.node]

          humanBoneArray.push({
            name: bone.bone,
            bone: new HumanBone(node, {
              axisLength: bone.axisLength,
              center: bone.center && new BABYLON.Vector3(bone.center.x, bone.center.y, bone.center.z),
              max: bone.max && new BABYLON.Vector3(bone.max.x, bone.max.y, bone.max.z),
              min: bone.min && new BABYLON.Vector3(bone.min.x, bone.min.y, bone.min.z),
              useDefaultValues: bone.useDefaultValues,
            }),
          });
        }),
      );
    }

    const humanDescription: HumanDescription = {
      armStretch: schemaHumanoid.armStretch,
      legStretch: schemaHumanoid.legStretch,
      upperArmTwist: schemaHumanoid.upperArmTwist,
      lowerArmTwist: schemaHumanoid.lowerArmTwist,
      upperLegTwist: schemaHumanoid.upperLegTwist,
      lowerLegTwist: schemaHumanoid.lowerLegTwist,
      feetSpacing: schemaHumanoid.feetSpacing,
      hasTranslationDoF: schemaHumanoid.hasTranslationDoF,
    };

    return new Humanoid(humanBoneArray, humanDescription);
  }
}

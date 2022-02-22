import { GLTFNode, VRMSchema } from '../types';
import { HumanLimit } from './humanLimit';

/**
 * A class represents a single `humanBone` of a VRM.
 */
export class HumanBone {
  /**
   * A [[GLTFNode]] (that actually is a `BABYLON.TransformNode`) that represents the bone.
   */
  public readonly node: GLTFNode;

  /**
   * A [[VRMHumanLimit]] object that represents properties of the bone.
   */
  public readonly humanLimit: HumanLimit;

  /**
   * Create a new VRMHumanBone.
   *
   * @param node A [[GLTFNode]] that represents the new bone
   * @param humanLimit A [[VRMHumanLimit]] object that represents properties of the new bone
   */
  public constructor(node: GLTFNode, humanLimit: HumanLimit) {
    this.node = node;
    this.humanLimit = humanLimit;
  }
}

/**
 * An array represents a `vrm.humanoid.humanBones` field of VRM specification.
 */
 export type HumanBoneArray = Array<{
  name: VRMSchema.HumanoidBoneName;
  bone: HumanBone;
}>;

/**
 * This object is a object variant of [[VRMHumanBoneArray]], used internally in [[VRMHumanoid]].
 */
 export type HumanBones = { [name in VRMSchema.HumanoidBoneName]: HumanBone[] }

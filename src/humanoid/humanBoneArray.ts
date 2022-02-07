import { VRMSchema } from '../types';
import { HumanBone } from './humanBone';

/**
 * An array represents a `vrm.humanoid.humanBones` field of VRM specification.
 */
export type HumanBoneArray = Array<{
  name: VRMSchema.HumanoidBoneName;
  bone: HumanBone;
}>;
import { VRMSchema } from '../types'
import { HumanBone } from './humanBone'

/**
 * This object is a object variant of [[VRMHumanBoneArray]], used internally in [[VRMHumanoid]].
 */
export type HumanBones = { [name in VRMSchema.HumanoidBoneName]: HumanBone[] }

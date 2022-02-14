import * as BABYLON from '@babylonjs/core'
import { VRMSchema } from '../types';

/**
 * This class is used by [[VRMLookAtHead]], applies look at direction.
 * There are currently two variant of applier: [[VRMLookAtBoneApplyer]] and [[VRMLookAtBlendShapeApplyer]].
 */
export abstract class LookAtApplyer {
  /**
   * It represents its type of applier.
   */
  public abstract readonly type: VRMSchema.FirstPersonLookAtTypeName;

  /**
   * Apply look at direction to its associated VRM model.
   *
   * @param euler `THREE.Euler` object that represents the look at direction
   */
  public abstract lookAt(euler: BABYLON.Vector3): void;
}

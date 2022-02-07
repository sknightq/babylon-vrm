import { GLTFNode } from '../types';
import { HumanLimit } from './humanLimit';

/**
 * A class represents a single `humanBone` of a VRM.
 */
export class HumanBone {
  /**
   * A [[GLTFNode]] (that actually is a `THREE.Object3D`) that represents the bone.
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
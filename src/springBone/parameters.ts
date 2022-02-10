import * as BABYLON from '@babylonjs/core';
export interface SpringBoneParameters {
  radius?: number;
  stiffnessForce?: number;
  gravityDir?: BABYLON.Vector3;
  gravityPower?: number;
  dragForce?: number;
  colliders?: BABYLON.Mesh[];
  center?: BABYLON.TransformNode | null;
}

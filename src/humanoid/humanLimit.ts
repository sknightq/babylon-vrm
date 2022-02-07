import * as BABYLON from '@babylonjs/core';
export interface HumanLimit {
  useDefaultValues?: boolean;
  min?: BABYLON.Vector3;
  max?: BABYLON.Vector3;
  center?: BABYLON.Vector3;
  axisLength?: number;
}
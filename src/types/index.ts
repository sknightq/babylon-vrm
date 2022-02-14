import * as BABYLON from '@babylonjs/core';
// Typedoc does not support export declarations yet
// then we have to use `namespace` instead of export declarations for now.
// See: https://github.com/TypeStrong/typedoc/pull/801

// import * as GLTFSchema from './GLTFSchema';
// import * as VRMSchema from './VRMSchema';

// export { GLTFSchema, VRMSchema };

export * from './GLTFSchema';
export * from './VRMSchema';

// export * from './types';

export type GLTFNode = BABYLON.TransformNode

export type GLTFMesh = BABYLON.Mesh

export type GLTFPrimitive = BABYLON.Mesh

export interface VRMPoseTransform {
  /**
   * Position of the transform.
   */
  position?: RawVector3;

  /**
   * Rotation of the transform.
   * Note that it's a quaternion.
   */
  rotation?: RawVector4;
}

export interface VRMPose {
  [boneName: string]: VRMPoseTransform | undefined;
}

/**
 * Vector3 but it's a raw array.
 */
export type RawVector3 = [number, number, number];

/**
 * Vector4 but it's a raw array.
 */
export type RawVector4 = [number, number, number, number];
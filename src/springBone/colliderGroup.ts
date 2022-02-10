import * as BABYLON from '@babylonjs/core'

/**
 * ColliderMesh, is actually just a `THREE.Mesh`.
 * Its radius and world position will be used for collisions.
 */
export type SpringBoneColliderMesh = BABYLON.Mesh;

/**
 * A group of colliders, equivalents to an element of `colliderGroups` field of VRM schema.
 *
 * @see https://github.com/vrm-c/UniVRM/blob/master/specification/0.0/schema/vrm.secondaryanimation.collidergroup.schema.json
 */
export interface SpringBoneColliderGroup {
  node: number;
  colliders: SpringBoneColliderMesh[];
}

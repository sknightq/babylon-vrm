import * as BABYLON from '@babylonjs/core'
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';
import { GLTFNode, VRMSchema } from '../types';
import { SpringBone } from './index';
import { SpringBoneColliderGroup, SpringBoneColliderMesh } from './colliderGroup';
import { SpringBoneGroup, SpringBoneManager } from './manager';
import { SpringBoneParameters } from './parameters';
import {traverse} from '../utils/traverse'
const _v3A = new BABYLON.Vector3();



/**
 * An importer that imports a [[VRMSpringBoneManager]] from a VRM extension of a GLTF.
 */
export class SpringBoneImporter {
  /**
   * Import a [[VRMLookAtHead]] from a VRM.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   */
  public async import(loader: GLTFLoader): Promise<SpringBoneManager | null> {
    const vrmExt: VRMSchema.VRM | undefined = loader.gltf.extensions?.VRM;
    if (!vrmExt) return null;

    const schemaSecondaryAnimation: VRMSchema.SecondaryAnimation | undefined = vrmExt.secondaryAnimation;
    if (!schemaSecondaryAnimation) return null;

    // Collision detection sphere mesh
    const colliderGroups = await this._importColliderMeshGroups(loader, schemaSecondaryAnimation);

    // Bones with the same attributes (same stiffiness and dragForce) are grouped in a boneGroup.。
    // Note that it's not just one row。
    const springBoneGroupList = await this._importSpringBoneGroupList(loader, schemaSecondaryAnimation, colliderGroups);

    return new SpringBoneManager(colliderGroups, springBoneGroupList);
  }

  protected _createSpringBone(bone: BABYLON.TransformNode, params: SpringBoneParameters = {}): SpringBone {
    return new SpringBone(bone, params);
  }

  protected async _importSpringBoneGroupList(
    loader: GLTFLoader,
    schemaSecondaryAnimation: VRMSchema.SecondaryAnimation,
    colliderGroups: SpringBoneColliderGroup[],
  ): Promise<SpringBoneGroup[]> {
    const springBoneGroups: VRMSchema.SecondaryAnimationSpring[] = schemaSecondaryAnimation.boneGroups || [];

    const springBoneGroupList: SpringBoneGroup[] = [];

    await Promise.all(
      springBoneGroups.map(async (vrmBoneGroup) => {
        if (
          vrmBoneGroup.stiffiness === undefined ||
          vrmBoneGroup.gravityDir === undefined ||
          vrmBoneGroup.gravityDir.x === undefined ||
          vrmBoneGroup.gravityDir.y === undefined ||
          vrmBoneGroup.gravityDir.z === undefined ||
          vrmBoneGroup.gravityPower === undefined ||
          vrmBoneGroup.dragForce === undefined ||
          vrmBoneGroup.hitRadius === undefined ||
          vrmBoneGroup.colliderGroups === undefined ||
          vrmBoneGroup.bones === undefined ||
          vrmBoneGroup.center === undefined
        ) {
          return;
        }

        const stiffnessForce = vrmBoneGroup.stiffiness;
        const gravityDir = new BABYLON.Vector3(
          vrmBoneGroup.gravityDir.x,
          vrmBoneGroup.gravityDir.y,
          -vrmBoneGroup.gravityDir.z, // VRM 0.0 uses left-handed y-up
        );
        const gravityPower = vrmBoneGroup.gravityPower;
        const dragForce = vrmBoneGroup.dragForce;
        const radius = vrmBoneGroup.hitRadius;

        const colliders: SpringBoneColliderMesh[] = [];
        vrmBoneGroup.colliderGroups.forEach((colliderIndex) => {
          colliders.push(...colliderGroups[colliderIndex].colliders);
        });

        const springBoneGroup: SpringBoneGroup = [];
        await Promise.all(
          vrmBoneGroup.bones.map(async (nodeIndex) => {
            // The root of the "shaking thing" bone can be taken from the VRM information
            // const springRootBone: GLTFNode = await gltf.parser.getDependency('node', nodeIndex);
            const springRootBone = loader.babylonScene.transformNodes[nodeIndex]
            
            const center: GLTFNode = vrmBoneGroup.center! !== -1 ? loader.babylonScene.transformNodes[vrmBoneGroup.center!] : null;

            // it's weird but there might be cases we can't find the root bone
            if (!springRootBone) {
              return;
            }

            // springRootBone.traverse((bone) => {
            //   const springBone = this._createSpringBone(bone, {
            //     radius,
            //     stiffnessForce,
            //     gravityDir,
            //     gravityPower,
            //     dragForce,
            //     colliders,
            //     center,
            //   });
            //   springBoneGroup.push(springBone);
            // });
            traverse(springRootBone, (bone)=>{
              const springBone = this._createSpringBone(bone as BABYLON.TransformNode, {
                radius,
                stiffnessForce,
                gravityDir,
                gravityPower,
                dragForce,
                colliders,
                center,
              });
              springBoneGroup.push(springBone);
            })
          }),
        );

        springBoneGroupList.push(springBoneGroup);
      }),
    );

    return springBoneGroupList;
  }

  /**
   * Create an array of [[VRMSpringBoneColliderGroup]].
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   * @param schemaSecondaryAnimation A `secondaryAnimation` field of VRM
   */
  protected async _importColliderMeshGroups(
    loader: GLTFLoader,
    schemaSecondaryAnimation: VRMSchema.SecondaryAnimation,
  ): Promise<SpringBoneColliderGroup[]> {
    const vrmColliderGroups = schemaSecondaryAnimation.colliderGroups;
    if (vrmColliderGroups === undefined) return [];

    const colliderGroups: SpringBoneColliderGroup[] = [];
    vrmColliderGroups.forEach(async (colliderGroup) => {
      if (colliderGroup.node === undefined || colliderGroup.colliders === undefined) {
        return;
      }

      // const bone = await gltf.parser.getDependency('node', colliderGroup.node);
      const bone = loader.babylonScene.transformNodes[colliderGroup.node]
      const colliders: SpringBoneColliderMesh[] = [];
      colliderGroup.colliders.forEach((collider) => {
        if (
          collider.offset === undefined ||
          collider.offset.x === undefined ||
          collider.offset.y === undefined ||
          collider.offset.z === undefined ||
          collider.radius === undefined
        ) {
          return;
        }

        const offset = _v3A.set(
          collider.offset.x,
          collider.offset.y,
          -collider.offset.z, // VRM 0.0 uses left-handed y-up
        );
        // const colliderMesh = this._createColliderMesh(collider.radius, offset);
        const colliderMesh = this._createColliderMesh(collider.radius, offset, loader.babylonScene);

        // bone.add(colliderMesh);
        colliderMesh.setParent(bone)
        colliders.push(colliderMesh);
      });

      const colliderMeshGroup = {
        node: colliderGroup.node,
        colliders,
      };
      colliderGroups.push(colliderMeshGroup);
    });

    return colliderGroups;
  }

  /**
   * Create a collider mesh.
   *
   * @param radius Radius of the new collider mesh
   * @param offset Offest of the new collider mesh
   */
  protected _createColliderMesh(radius: number, offset: BABYLON.Vector3, scene:BABYLON.Scene): SpringBoneColliderMesh {
    // NOTE:_colliderMaterial may be unuseful
    const _colliderMaterial = new BABYLON.Material('collider',scene)

    // const colliderMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 8, 4), _colliderMaterial)
    const colliderMesh = BABYLON.MeshBuilder.CreateSphere("collider",{segments:32, diameter: 2 * radius})

    colliderMesh.visibility = 0

    colliderMesh.position.copyFrom(offset);

    // the name have to be this in order to exclude colliders from bounding box
    // (See Viewer.ts, search for child.name === 'vrmColliderSphere')
    colliderMesh.name = 'vrmColliderSphere';

    // We will use the radius of the sphere for collision vs bones. Get bounding sphere by colliderMesh.getBoundingInfo() in BabylonJS
    // TODO: `boundingSphere` must be created to compute the radius.
    // colliderMesh.geometry.computeBoundingSphere();

    // IMPORTANT: In BabylonJs, the bounding sphere's radius base on the diagonal of bounding box, the scale is temporary
    // more detail:
    // https://forum.babylonjs.com/t/dimensions-of-boundingsphere-of-sphere-mesh-dont-match/14992/4
    // https://gamedev.stackexchange.com/questions/159511/how-can-i-generate-the-smallest-enclosing-sphere-from-a-mesh
    colliderMesh.getBoundingInfo().boundingSphere.scale(1 / 3)
    // console.log(colliderMesh.getBoundingInfo().boundingSphere.radius)

    return colliderMesh;
  }
}

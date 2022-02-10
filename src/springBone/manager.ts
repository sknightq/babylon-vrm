import * as BABYLON from '@babylonjs/core'
import { SpringBone } from './index'
import { SpringBoneColliderGroup } from './colliderGroup'

/**
 * Represents a single spring bone group of a VRM.
 */
export type SpringBoneGroup = SpringBone[]

/**
 * A class manages every spring bones on a VRM.
 */
export class SpringBoneManager {
  public readonly colliderGroups: SpringBoneColliderGroup[] = []
  public readonly springBoneGroupList: SpringBoneGroup[] = []

  /**
   * Create a new [[VRMSpringBoneManager]]
   *
   * @param springBoneGroupList An array of [[VRMSpringBoneGroup]]
   */
  public constructor(colliderGroups: SpringBoneColliderGroup[], springBoneGroupList: SpringBoneGroup[]) {
    this.colliderGroups = colliderGroups
    this.springBoneGroupList = springBoneGroupList
  }

  /**
   * Set all bones be calculated based on the space relative from this object.
   * If `null` is given, springbone will be calculated in world space.
   * @param root Root object, or `null`
   */
  public setCenter(root: BABYLON.TransformNode | null): void {
    this.springBoneGroupList.forEach(springBoneGroup => {
      springBoneGroup.forEach(springBone => {
        springBone.center = root
      })
    })
  }

  /**
   * Update every spring bone attached to this manager.
   *
   * @param delta deltaTime
   */
  public lateUpdate(delta: number): void {
    this.springBoneGroupList.forEach(springBoneGroup => {
      springBoneGroup.forEach(springBone => {
        springBone.update(delta)
      })
    })
  }

  /**
   * Reset every spring bone attached to this manager.
   */
  public reset(): void {
    this.springBoneGroupList.forEach(springBoneGroup => {
      springBoneGroup.forEach(springBone => {
        springBone.reset()
      })
    })
  }
}

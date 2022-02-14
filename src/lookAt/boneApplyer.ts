import * as BABYLON from '@babylonjs/core'
import { Humanoid } from '../humanoid'
import { GLTFNode, VRMSchema } from '../types'
import { CurveMapper } from './curveMapper'
import { LookAtApplyer } from './applyer'
// import { LookAtHead } from './head'

const _euler = new BABYLON.Vector3(0.0, 0.0, 0.0)

/**
 * This class is used by [[VRMLookAtHead]], applies look at direction to eye bones of a VRM.
 */
export class LookAtBoneApplyer extends LookAtApplyer {
  public readonly type = VRMSchema.FirstPersonLookAtTypeName.Bone

  private readonly _curveHorizontalInner: CurveMapper
  private readonly _curveHorizontalOuter: CurveMapper
  private readonly _curveVerticalDown: CurveMapper
  private readonly _curveVerticalUp: CurveMapper

  private readonly _leftEye: GLTFNode | null
  private readonly _rightEye: GLTFNode | null

  /**
   * Create a new VRMLookAtBoneApplyer.
   *
   * @param humanoid A [[VRMHumanoid]] used by this applier
   * @param curveHorizontalInner A [[VRMCurveMapper]] used for inner transverse direction
   * @param curveHorizontalOuter A [[VRMCurveMapper]] used for outer transverse direction
   * @param curveVerticalDown A [[VRMCurveMapper]] used for down direction
   * @param curveVerticalUp A [[VRMCurveMapper]] used for up direction
   */
  constructor(humanoid: Humanoid, curveHorizontalInner: CurveMapper, curveHorizontalOuter: CurveMapper, curveVerticalDown: CurveMapper, curveVerticalUp: CurveMapper) {
    super()

    this._curveHorizontalInner = curveHorizontalInner
    this._curveHorizontalOuter = curveHorizontalOuter
    this._curveVerticalDown = curveVerticalDown
    this._curveVerticalUp = curveVerticalUp

    this._leftEye = humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftEye)
    this._rightEye = humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightEye)
  }
  // euler order is YXZ
  public lookAt(euler: BABYLON.Vector3): void {
    const srcX = euler.x
    const srcY = euler.y

    // left
    if (this._leftEye) {
      if (srcX < 0.0) {
        _euler.x = -this._curveVerticalDown.map(-srcX)
      } else {
        _euler.x = this._curveVerticalUp.map(srcX)
      }

      if (srcY < 0.0) {
        _euler.y = -this._curveHorizontalInner.map(-srcY)
      } else {
        _euler.y = this._curveHorizontalOuter.map(srcY)
      }

      this._leftEye.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(_euler.x, _euler.y, _euler.z)
      // this._leftEye.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(_euler.y, _euler.x, _euler.z)
    }

    // right
    if (this._rightEye) {
      if (srcX < 0.0) {
        _euler.x = -this._curveVerticalDown.map(-srcX)
      } else {
        _euler.x = this._curveVerticalUp.map(srcX)
      }

      if (srcY < 0.0) {
        _euler.y = -this._curveHorizontalOuter.map(-srcY)
      } else {
        _euler.y = this._curveHorizontalInner.map(srcY)
      }

      this._rightEye.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(_euler.x, _euler.y, _euler.z)
      // this._rightEye.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(_euler.y, _euler.x, _euler.z)
    }
  }
}

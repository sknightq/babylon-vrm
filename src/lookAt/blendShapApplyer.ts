import * as BABYLON from '@babylonjs/core'
import { BlendShapeProxy } from '../blendShape';
import { VRMSchema } from '../types';
import { CurveMapper } from './curveMapper';
import { LookAtApplyer } from './applyer';

/**
 * This class is used by [[VRMLookAtHead]], applies look at direction to eye blend shapes of a VRM.
 */
export class LookAtBlendShapeApplyer extends LookAtApplyer {
  public readonly type = VRMSchema.FirstPersonLookAtTypeName.BlendShape;

  private readonly _curveHorizontal: CurveMapper;
  private readonly _curveVerticalDown: CurveMapper;
  private readonly _curveVerticalUp: CurveMapper;

  private readonly _blendShapeProxy: BlendShapeProxy;

  /**
   * Create a new VRMLookAtBlendShapeApplyer.
   *
   * @param blendShapeProxy A [[VRMBlendShapeProxy]] used by this applier
   * @param curveHorizontal A [[VRMCurveMapper]] used for transverse direction
   * @param curveVerticalDown A [[VRMCurveMapper]] used for down direction
   * @param curveVerticalUp A [[VRMCurveMapper]] used for up direction
   */
  constructor(
    blendShapeProxy: BlendShapeProxy,
    curveHorizontal: CurveMapper,
    curveVerticalDown: CurveMapper,
    curveVerticalUp: CurveMapper,
  ) {
    super();

    this._curveHorizontal = curveHorizontal;
    this._curveVerticalDown = curveVerticalDown;
    this._curveVerticalUp = curveVerticalUp;

    this._blendShapeProxy = blendShapeProxy;
  }

  public name(): VRMSchema.FirstPersonLookAtTypeName {
    return VRMSchema.FirstPersonLookAtTypeName.BlendShape;
  }

  public lookAt(euler: BABYLON.Vector3): void {
    const srcX = euler.x;
    const srcY = euler.y;

    if (srcX < 0.0) {
      this._blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Lookup, 0.0);
      this._blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Lookdown, this._curveVerticalDown.map(-srcX));
    } else {
      this._blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Lookdown, 0.0);
      this._blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Lookup, this._curveVerticalUp.map(srcX));
    }

    if (srcY < 0.0) {
      this._blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Lookleft, 0.0);
      this._blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Lookright, this._curveHorizontal.map(-srcY));
    } else {
      this._blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Lookright, 0.0);
      this._blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Lookleft, this._curveHorizontal.map(srcY));
    }
  }
}

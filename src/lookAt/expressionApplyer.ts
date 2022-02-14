import * as BABYLON from '@babylonjs/core'
import { ExpressionProxy } from '../expression';
import { VRMSchema } from '../types';
import { CurveMapper } from './curveMapper';
import { LookAtApplyer } from './applyer';

/**
 * This class is used by [[VRMLookAtHead]], applies look at direction to eye blend shapes of a VRM.
 */
export class LookAtExpressionApplyer extends LookAtApplyer {
  public readonly type = VRMSchema.FirstPersonLookAtTypeName.Expression;

  private readonly _curveHorizontal: CurveMapper;
  private readonly _curveVerticalDown: CurveMapper;
  private readonly _curveVerticalUp: CurveMapper;

  private readonly _expressionProxy: ExpressionProxy;

  /**
   * Create a new VRMLookAtExpressionApplyer
   *
   * @param expressionProxy A [[VRMExpressionProxy]] used by this applier
   * @param curveHorizontal A [[VRMCurveMapper]] used for transverse direction
   * @param curveVerticalDown A [[VRMCurveMapper]] used for down direction
   * @param curveVerticalUp A [[VRMCurveMapper]] used for up direction
   */
  constructor(
    expressionProxy: ExpressionProxy,
    curveHorizontal: CurveMapper,
    curveVerticalDown: CurveMapper,
    curveVerticalUp: CurveMapper,
  ) {
    super();

    this._curveHorizontal = curveHorizontal;
    this._curveVerticalDown = curveVerticalDown;
    this._curveVerticalUp = curveVerticalUp;

    this._expressionProxy = expressionProxy;
  }

  public name(): VRMSchema.FirstPersonLookAtTypeName {
    return VRMSchema.FirstPersonLookAtTypeName.Expression;
  }

  public lookAt(euler: BABYLON.Vector3): void {
    const srcX = euler.x;
    const srcY = euler.y;

    if (srcX < 0.0) {
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookup, 0.0);
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookdown, this._curveVerticalDown.map(-srcX));
    } else {
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookdown, 0.0);
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookup, this._curveVerticalUp.map(srcX));
    }

    if (srcY < 0.0) {
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookleft, 0.0);
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookright, this._curveHorizontal.map(-srcY));
    } else {
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookright, 0.0);
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookleft, this._curveHorizontal.map(srcY));
    }
  }
}

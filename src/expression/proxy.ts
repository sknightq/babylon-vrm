import { VRMSchema } from '../types';
import { ExpressionGroup } from './group';

export class ExpressionProxy {
  /**
   * List of registered blend shape.
   */
  private readonly _expressionGroups: { [name: string]: ExpressionGroup } = {};

  /**
   * A map from [[VRMSchema.ExpressionPresetMap]] to its actual blend shape name.
   */
  private readonly _expressionPresetMap: { [presetName in VRMSchema.ExpressionPresetName]?: string } = {};

  /**
   * A list of name of unknown blend shapes.
   */
  private readonly _unknownGroupNames: string[] = [];

  /**
   * Create a new VRMExpression.
   */
  public constructor() {
    // do nothing
  }

  /**
   * List of name of registered blend shape group.
   */
  public get expressions(): string[] {
    return Object.keys(this._expressionGroups);
  }

  /**
   * A map from [[VRMSchema.ExpressionPresetName]] to its actual blend shape name.
   */
  public get expressionPresetMap(): { [presetName in VRMSchema.ExpressionPresetName]?: string } {
    return this._expressionPresetMap;
  }

  /**
   * A list of name of unknown expressions.
   */
  public get unknownGroupNames(): string[] {
    return this._unknownGroupNames;
  }

  /**
   * Return registered expression group.
   *
   * @param name Name of the expression group
   */
  public getExpressionGroup(name: string | VRMSchema.ExpressionPresetName): ExpressionGroup | undefined {
    const presetName = this._expressionPresetMap[name as VRMSchema.ExpressionPresetName];
    const controller = presetName ? this._expressionGroups[presetName] : this._expressionGroups[name];
    if (!controller) {
      console.warn(`no expression found by ${name}`);
      return undefined;
    }
    return controller;
  }

  /**
   * Register a blend shape (expreesion) group.
   *
   * @param name Name of the blend shape gorup
   * @param controller VRMExpressionController that describes the expression group
   */
  public registeExpressionGroup(
    name: string,
    presetName: VRMSchema.ExpressionPresetName | undefined,
    controller: ExpressionGroup,
  ): void {
    this._expressionGroups[name] = controller;
    if (presetName) {
      this._expressionPresetMap[presetName] = name;
    } else {
      this._unknownGroupNames.push(name);
    }
  }

  /**
   * Get current weight of specified blend shape group.
   *
   * @param name Name of the blend shape group
   */
  public getValue(name: VRMSchema.ExpressionPresetName | string): number | null {
    const controller = this.getExpressionGroup(name);
    return controller?.weight ?? null;
  }

  /**
   * Set a weight to specified blend shape group.
   * Map from 0~100 to 0~1
   * @param name Name of the blend shape group
   * @param weight Weight
   */
  public setValue(name: VRMSchema.ExpressionPresetName | string, weight: number): void {
    const controller = this.getExpressionGroup(name);
    if (controller) {
      controller.weight = Math.max(Math.min(weight, 1.0), 0.0);
    }
  }

  // NOTE: Make a short face animation by creating a track
  // TODO: Change the example from 3JS to BJS
  /**
   * Get a track name of specified blend shape group.
   * This track name is needed to manipulate its blend shape group via keyframe animations.
   * 
   *
   * @example Manipulate a blend shape group using keyframe animation
   * ```js
   * const trackName = vrm.expressionProxy.getExpressionTrackName( VRMSchema.ExpressionPresetName.Blink );
   * const track = new THREE.NumberKeyframeTrack(
   *   name,
   *   [ 0.0, 0.5, 1.0 ], // times
   *   [ 0.0, 1.0, 0.0 ] // values
   * );
   *
   * const clip = new THREE.AnimationClip(
   *   'blink', // name
   *   1.0, // duration
   *   [ track ] // tracks
   * );
   *
   * const mixer = new THREE.AnimationMixer( vrm.scene );
   * const action = mixer.clipAction( clip );
   * action.play();
   * ```
   *
   * @param name Name of the blend shape group
   */
  public getExpressionTrackName(name: VRMSchema.ExpressionPresetName | string): string | null {
    const controller = this.getExpressionGroup(name);
    return controller ? `${controller.name}.weight` : null;
  }

  /**
   * Update every blend shape (expression) groups.
   */
  public update(): void {
    Object.keys(this._expressionGroups).forEach((name) => {
      const controller = this._expressionGroups[name];
      controller.clearAppliedWeight();
    });

    Object.keys(this._expressionGroups).forEach((name) => {
      const controller = this._expressionGroups[name];
      controller.applyWeight();
    });
  }
}

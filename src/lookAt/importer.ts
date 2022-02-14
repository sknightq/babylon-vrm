import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';
import { BlendShapeProxy } from '../blendShape';
import { FirstPerson } from '../firstPerson';
import { Humanoid } from '../humanoid';
import { VRMSchema } from '../types';
import { CurveMapper } from './curveMapper';
import { LookAtApplyer } from './applyer';
import { LookAtBlendShapeApplyer } from './blendShapeApplyer';
import { LookAtBoneApplyer } from './boneApplyer';
import { LookAtHead } from './head';

// THREE.Math has been renamed to THREE.MathUtils since r113.
// We are going to define the DEG2RAD by ourselves for a while
// https://github.com/mrdoob/three.js/pull/18270
const DEG2RAD = Math.PI / 180; // THREE.MathUtils.DEG2RAD;

/**
 * An importer that imports a [[VRMLookAtHead]] from a VRM extension of a GLTF.
 */
export class LookAtImporter {
  /**
   * Import a [[VRMLookAtHead]] from a VRM.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   * @param blendShapeProxy A [[VRMBlendShapeProxy]] instance that represents the VRM
   * @param humanoid A [[VRMHumanoid]] instance that represents the VRM
   */
  public import(
    loader: GLTFLoader,
    firstPerson: FirstPerson,
    blendShapeProxy: BlendShapeProxy,
    humanoid: Humanoid,
  ): LookAtHead | null {
    const vrmExt: VRMSchema.VRM | undefined = loader.gltf.extensions?.VRM;
    if (!vrmExt) {
      return null;
    }

    const schemaFirstPerson: VRMSchema.FirstPerson | undefined = vrmExt.firstPerson;
    if (!schemaFirstPerson) {
      return null;
    }

    const applyer = this._importApplyer(schemaFirstPerson, blendShapeProxy, humanoid);
    return new LookAtHead(firstPerson, applyer || undefined);
  }

  protected _importApplyer(
    schemaFirstPerson: VRMSchema.FirstPerson,
    blendShapeProxy: BlendShapeProxy,
    humanoid: Humanoid,
  ): LookAtApplyer | null {
    const lookAtHorizontalInner = schemaFirstPerson.lookAtHorizontalInner;
    const lookAtHorizontalOuter = schemaFirstPerson.lookAtHorizontalOuter;
    const lookAtVerticalDown = schemaFirstPerson.lookAtVerticalDown;
    const lookAtVerticalUp = schemaFirstPerson.lookAtVerticalUp;

    switch (schemaFirstPerson.lookAtTypeName) {
      case VRMSchema.FirstPersonLookAtTypeName.Bone: {
        if (
          lookAtHorizontalInner === undefined ||
          lookAtHorizontalOuter === undefined ||
          lookAtVerticalDown === undefined ||
          lookAtVerticalUp === undefined
        ) {
          return null;
        } else {
          return new LookAtBoneApplyer(
            humanoid,
            this._importCurveMapperBone(lookAtHorizontalInner),
            this._importCurveMapperBone(lookAtHorizontalOuter),
            this._importCurveMapperBone(lookAtVerticalDown),
            this._importCurveMapperBone(lookAtVerticalUp),
          );
        }
      }
      case VRMSchema.FirstPersonLookAtTypeName.BlendShape: {
        if (lookAtHorizontalOuter === undefined || lookAtVerticalDown === undefined || lookAtVerticalUp === undefined) {
          return null;
        } else {
          return new LookAtBlendShapeApplyer(
            blendShapeProxy,
            this._importCurveMapperBlendShape(lookAtHorizontalOuter),
            this._importCurveMapperBlendShape(lookAtVerticalDown),
            this._importCurveMapperBlendShape(lookAtVerticalUp),
          );
        }
      }
      default: {
        return null;
      }
    }
  }

  private _importCurveMapperBone(map: VRMSchema.FirstPersonDegreeMap): CurveMapper {
    return new CurveMapper(
      typeof map.xRange === 'number' ? DEG2RAD * map.xRange : undefined,
      typeof map.yRange === 'number' ? DEG2RAD * map.yRange : undefined,
      map.curve,
    );
  }

  private _importCurveMapperBlendShape(map: VRMSchema.FirstPersonDegreeMap): CurveMapper {
    return new CurveMapper(typeof map.xRange === 'number' ? DEG2RAD * map.xRange : undefined, map.yRange, map.curve);
  }
}

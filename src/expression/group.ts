import * as BABYLON from '@babylonjs/core'
import { GLTFPrimitive } from '../types'

export interface ExpressionBind {
  meshes: GLTFPrimitive[]
  morphTargetIndex: number
  weight: number
}

enum ExpressionMaterialValueType {
  NUMBER,
  VECTOR2,
  VECTOR3,
  Quaternion,
  COLOR3
}

export interface ExpressionMaterialValue {
  material: BABYLON.Material
  propertyName: string
  defaultValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3
  targetValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3
  deltaValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3 // targetValue - defaultValue
  type: ExpressionMaterialValueType
}

const _v2 = new BABYLON.Vector2()
const _v3 = new BABYLON.Vector3()
const _v4 = new BABYLON.Quaternion()
const _color = new BABYLON.Color3()

// The monitoring target of animationMixer must be inside the Scene.
// Therefore, although it is not a display object, it can inherit BABYLON.TransformNode and put it in the Scene.
export class ExpressionGroup extends BABYLON.TransformNode {
  public weight = 0.0
  public isBinary = false

  private _binds: ExpressionBind[] = []
  private _materialValues: ExpressionMaterialValue[] = []
  type: string
  name: string
  // visible: boolean

  constructor(expressionName: string) {
    super(`${expressionName}`)
    this.name = `ExpressionController_${expressionName}`

    // Make it clear that it is not  BABYLON.TransformNode as a remedy for traverse
    this.type = 'ExpressionController'
    // Since it is not an object to be displayed, set visible to false to reduce the load.
    // This allows you to omit the automatic matrix calculation for each frame for this instance.
    // this.visible = false
    // TODO: check if it works
    this.setEnabled(false)
  }

  public addBind(args: { meshes: GLTFPrimitive[]; morphTargetIndex: number; weight: number }): void {
    // original weight is 0-100 but we want to deal with this value within 0-1
    const weight = args.weight / 100

    this._binds.push({
      meshes: args.meshes,
      morphTargetIndex: args.morphTargetIndex,
      weight
    })
  }

  public addMaterialValue(args: {
    material: BABYLON.Material
    propertyName: string
    targetValue: number[]
    defaultValue?: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3
  }): void {
    const material = args.material
    const propertyName = args.propertyName

    let value = (material as any)[propertyName]
    // property has not been found
    if (!value) {
      return
    }
    value = args.defaultValue || value

    let type: ExpressionMaterialValueType
    let defaultValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3
    let targetValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3
    let deltaValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3

    if (value.isVector2) {
      type = ExpressionMaterialValueType.VECTOR2
      defaultValue = (value as BABYLON.Vector2).clone()
      targetValue = new BABYLON.Vector2().fromArray(args.targetValue)
      deltaValue = targetValue.clone().subtract(defaultValue)
    } else if (value.isVector3) {
      type = ExpressionMaterialValueType.VECTOR3
      defaultValue = (value as BABYLON.Vector3).clone()
      targetValue = new BABYLON.Vector3().fromArray(args.targetValue)
      deltaValue = targetValue.clone().subtract(defaultValue)
    } else if (value.isVector4) {
      type = ExpressionMaterialValueType.Quaternion
      defaultValue = (value as BABYLON.Quaternion).clone()

      // NOTE: vectorProperty and targetValue index is different from each other exported vrm by UniVRM file is
      //
      // vectorProperty
      // offset = targetValue[0], targetValue[1]
      // tiling = targetValue[2], targetValue[3]
      //
      // targetValue
      // offset = targetValue[2], targetValue[3]
      // tiling = targetValue[0], targetValue[1]
      // targetValue = new THREE.Vector4().fromArray([
      //   args.targetValue[2],
      //   args.targetValue[3],
      //   args.targetValue[0],
      //   args.targetValue[1],
      // ]);

      targetValue = BABYLON.Quaternion.FromArray([args.targetValue[2], args.targetValue[3], args.targetValue[0], args.targetValue[1]])
      deltaValue = targetValue.clone().subtract(defaultValue)
    } else if (value.isColor) {
      type = ExpressionMaterialValueType.COLOR3
      defaultValue = (value as BABYLON.Color3).clone()
      targetValue = new BABYLON.Color3().fromArray(args.targetValue)
      deltaValue = targetValue.clone().subtract(defaultValue)
    } else {
      type = ExpressionMaterialValueType.NUMBER
      defaultValue = value as number
      targetValue = args.targetValue[0]
      deltaValue = targetValue - defaultValue
    }

    this._materialValues.push({
      material,
      propertyName,
      defaultValue,
      targetValue,
      deltaValue,
      type
    })
  }

  /**
   * Apply weight to every assigned blend shapes.
   * Should be called via {@link BlendShapeMaster#update}.
   */
  public applyWeight(): void {
    const w = this.isBinary ? (this.weight < 0.5 ? 0.0 : 1.0) : this.weight

    this._binds.forEach(bind => {
      bind.meshes.forEach(mesh => {
        const morphTargetsManager = mesh.morphTargetManager
        if (!morphTargetsManager) {
          return
        }
        // TODO: we should kick this at `addBind`
        morphTargetsManager.getTarget(bind.morphTargetIndex).influence += w * bind.weight
      })
    })

    this._materialValues.forEach(materialValue => {
      const prop = (materialValue.material as any)[materialValue.propertyName]
      if (prop === undefined) {
        return
      }
      // TODO: we should kick this at `addMaterialValue`
      if (materialValue.type === ExpressionMaterialValueType.NUMBER) {
        const deltaValue = materialValue.deltaValue as number
        ;(materialValue.material as any)[materialValue.propertyName] += deltaValue * w
      } else if (materialValue.type === ExpressionMaterialValueType.VECTOR2) {
        const deltaValue = materialValue.deltaValue as BABYLON.Vector2
        ;(materialValue.material as any)[materialValue.propertyName].add(_v2.copyFrom(deltaValue).multiplyByFloats(w, w))
      } else if (materialValue.type === ExpressionMaterialValueType.VECTOR3) {
        const deltaValue = materialValue.deltaValue as BABYLON.Vector3
        ;(materialValue.material as any)[materialValue.propertyName].add(_v3.copyFrom(deltaValue).multiplyByFloats(w, w, w))
      } else if (materialValue.type === ExpressionMaterialValueType.Quaternion) {
        const multiplyDeltaValue = BABYLON.Quaternion.FromArray([
          (materialValue.deltaValue as any)[0] * w,
          (materialValue.deltaValue as any)[1] * w,
          (materialValue.deltaValue as any)[2] * w,
          (materialValue.deltaValue as any)[3] * w
        ])
        ;(materialValue.material as any)[materialValue.propertyName].add(_v4.copyFrom(multiplyDeltaValue))
      } else if (materialValue.type === ExpressionMaterialValueType.COLOR3) {
        const multiplyDeltaValue = BABYLON.Color3.FromArray([(materialValue.deltaValue as any)[0] * w, (materialValue.deltaValue as any)[1] * w, (materialValue.deltaValue as any)[2] * w])
        ;(materialValue.material as any)[materialValue.propertyName].add(_color.copyFrom(multiplyDeltaValue))
      }

      if (typeof (materialValue.material as any).shouldApplyUniforms === 'boolean') {
        ;(materialValue.material as any).shouldApplyUniforms = true
      }
    })
  }

  /**
   * Clear previously assigned blend shapes.
   */
  public clearAppliedWeight(): void {
    this._binds.forEach(bind => {
      bind.meshes.forEach(mesh => {
        const morphTargetsManager = mesh.morphTargetManager
        if (!morphTargetsManager) {
          return
        } 
        // TODO: we should kick this at `addBind`
        morphTargetsManager.getTarget(bind.morphTargetIndex).influence = 0
      })
    })

    this._materialValues.forEach(materialValue => {
      const prop = (materialValue.material as any)[materialValue.propertyName]
      if (prop === undefined) {
        return
      } 
      // TODO: we should kick this at `addMaterialValue`
      if (materialValue.type === ExpressionMaterialValueType.NUMBER) {
        const defaultValue = materialValue.defaultValue as number
        ;(materialValue.material as any)[materialValue.propertyName] = defaultValue
      } else if (materialValue.type === ExpressionMaterialValueType.VECTOR2) {
        const defaultValue = materialValue.defaultValue as BABYLON.Vector2
        ;(materialValue.material as any)[materialValue.propertyName].copy(defaultValue)
      } else if (materialValue.type === ExpressionMaterialValueType.VECTOR3) {
        const defaultValue = materialValue.defaultValue as BABYLON.Vector3
        ;(materialValue.material as any)[materialValue.propertyName].copy(defaultValue)
      } else if (materialValue.type === ExpressionMaterialValueType.Quaternion) {
        const defaultValue = materialValue.defaultValue as BABYLON.Quaternion
        ;(materialValue.material as any)[materialValue.propertyName].copy(defaultValue)
      } else if (materialValue.type === ExpressionMaterialValueType.COLOR3) {
        const defaultValue = materialValue.defaultValue as BABYLON.Color3
        ;(materialValue.material as any)[materialValue.propertyName].copy(defaultValue)
      }

      if (typeof (materialValue.material as any).shouldApplyUniforms === 'boolean') {
        ;(materialValue.material as any).shouldApplyUniforms = true
      }
    })
  }
}
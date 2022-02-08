import * as BABYLON from '@babylonjs/core'
import { GLTFPrimitive } from '../types'

export interface BlendShapeBind {
  meshes: GLTFPrimitive[]
  morphTargetIndex: number
  weight: number
}

enum BlendShapeMaterialValueType {
  NUMBER,
  VECTOR2,
  VECTOR3,
  Quaternion,
  COLOR3
}

export interface BlendShapeMaterialValue {
  material: BABYLON.Material
  propertyName: string
  defaultValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3
  targetValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3
  deltaValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3 // targetValue - defaultValue
  type: BlendShapeMaterialValueType
}

const _v2 = new BABYLON.Vector2()
const _v3 = new BABYLON.Vector3()
const _v4 = new BABYLON.Quaternion()
const _color = new BABYLON.Color3()

// animationMixer の監視対象は、Scene の中に入っている必要がある。
// そのため、表示オブジェクトではないけれど、Object3D を継承して Scene に投入できるようにする。
export class BlendShapeGroup extends BABYLON.TransformNode {
  public weight = 0.0
  public isBinary = false

  private _binds: BlendShapeBind[] = []
  private _materialValues: BlendShapeMaterialValue[] = []
  type: string
  name: string
  visible: boolean

  constructor(expressionName: string) {
    super(`${expressionName}`)
    this.name = `BlendShapeController_${expressionName}`

    // traverse 時の救済手段として Object3D ではないことを明示しておく
    this.type = 'BlendShapeController'
    // 表示目的のオブジェクトではないので、負荷軽減のために visible を false にしておく。
    // これにより、このインスタンスに対する毎フレームの matrix 自動計算を省略できる。
    this.visible = false
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
    if (!value) {
      // property has not been found
      return
    }
    value = args.defaultValue || value

    let type: BlendShapeMaterialValueType
    let defaultValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3
    let targetValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3
    let deltaValue: number | BABYLON.Vector2 | BABYLON.Vector3 | BABYLON.Quaternion | BABYLON.Color3

    if (value.isVector2) {
      type = BlendShapeMaterialValueType.VECTOR2
      defaultValue = (value as BABYLON.Vector2).clone()
      targetValue = new BABYLON.Vector2().fromArray(args.targetValue)
      deltaValue = targetValue.clone().subtract(defaultValue)
    } else if (value.isVector3) {
      type = BlendShapeMaterialValueType.VECTOR3
      defaultValue = (value as BABYLON.Vector3).clone()
      targetValue = new BABYLON.Vector3().fromArray(args.targetValue)
      deltaValue = targetValue.clone().subtract(defaultValue)
    } else if (value.isVector4) {
      type = BlendShapeMaterialValueType.Quaternion
      defaultValue = (value as BABYLON.Quaternion).clone()

      // vectorProperty and targetValue index is different from each other
      // exported vrm by UniVRM file is
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
      type = BlendShapeMaterialValueType.COLOR3
      defaultValue = (value as BABYLON.Color3).clone()
      targetValue = new BABYLON.Color3().fromArray(args.targetValue)
      deltaValue = targetValue.clone().subtract(defaultValue)
    } else {
      type = BlendShapeMaterialValueType.NUMBER
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

    // this._binds.forEach(bind => {
    //   bind.meshes.forEach(mesh => {
    //     if (!mesh.morphTargetInfluences) {
    //       return
    //     } // TODO: we should kick this at `addBind`
    //     mesh.morphTargetInfluences[bind.morphTargetIndex] += w * bind.weight
    //   })
    // })

    this._materialValues.forEach(materialValue => {
      const prop = (materialValue.material as any)[materialValue.propertyName]
      if (prop === undefined) {
        return
      } // TODO: we should kick this at `addMaterialValue`

      if (materialValue.type === BlendShapeMaterialValueType.NUMBER) {
        const deltaValue = materialValue.deltaValue as number
        ;(materialValue.material as any)[materialValue.propertyName] += deltaValue * w
      } else if (materialValue.type === BlendShapeMaterialValueType.VECTOR2) {
        const deltaValue = materialValue.deltaValue as BABYLON.Vector2
        ;(materialValue.material as any)[materialValue.propertyName].add(_v2.copyFrom(deltaValue).multiplyByFloats(w, w))
      } else if (materialValue.type === BlendShapeMaterialValueType.VECTOR3) {
        const deltaValue = materialValue.deltaValue as BABYLON.Vector3
        ;(materialValue.material as any)[materialValue.propertyName].add(_v3.copyFrom(deltaValue).multiplyByFloats(w, w, w))
      } else if (materialValue.type === BlendShapeMaterialValueType.Quaternion) {
        const multiplyDeltaValue = BABYLON.Quaternion.FromArray([materialValue.deltaValue[0] * w, materialValue.deltaValue[1] * w, materialValue.deltaValue[2] * w, materialValue.deltaValue[3] * w])
        ;(materialValue.material as any)[materialValue.propertyName].add(_v4.copyFrom(multiplyDeltaValue))
      } else if (materialValue.type === BlendShapeMaterialValueType.COLOR3) {
        const multiplyDeltaValue = BABYLON.Color3.FromArray([materialValue.deltaValue[0] * w, materialValue.deltaValue[1] * w, materialValue.deltaValue[2] * w])
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
    // this._binds.forEach(bind => {
    //   bind.meshes.forEach(mesh => {
    //     if (!mesh.morphTargetInfluences) {
    //       return
    //     } // TODO: we should kick this at `addBind`
    //     mesh.morphTargetInfluences[bind.morphTargetIndex] = 0.0
    //   })
    // })

    this._materialValues.forEach(materialValue => {
      const prop = (materialValue.material as any)[materialValue.propertyName]
      if (prop === undefined) {
        return
      } // TODO: we should kick this at `addMaterialValue`

      if (materialValue.type === BlendShapeMaterialValueType.NUMBER) {
        const defaultValue = materialValue.defaultValue as number
        ;(materialValue.material as any)[materialValue.propertyName] = defaultValue
      } else if (materialValue.type === BlendShapeMaterialValueType.VECTOR2) {
        const defaultValue = materialValue.defaultValue as BABYLON.Vector2
        ;(materialValue.material as any)[materialValue.propertyName].copy(defaultValue)
      } else if (materialValue.type === BlendShapeMaterialValueType.VECTOR3) {
        const defaultValue = materialValue.defaultValue as BABYLON.Vector3
        ;(materialValue.material as any)[materialValue.propertyName].copy(defaultValue)
      } else if (materialValue.type === BlendShapeMaterialValueType.Quaternion) {
        const defaultValue = materialValue.defaultValue as BABYLON.Quaternion
        ;(materialValue.material as any)[materialValue.propertyName].copy(defaultValue)
      } else if (materialValue.type === BlendShapeMaterialValueType.COLOR3) {
        const defaultValue = materialValue.defaultValue as BABYLON.Color3
        ;(materialValue.material as any)[materialValue.propertyName].copy(defaultValue)
      }

      if (typeof (materialValue.material as any).shouldApplyUniforms === 'boolean') {
        ;(materialValue.material as any).shouldApplyUniforms = true
      }
    })
  }
}
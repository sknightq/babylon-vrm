import * as BABYLON from '@babylonjs/core'
import { GLTFSchema, VRMSchema } from '../types'
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0'
import { gltfExtractPrimitivesFromNode } from '../utils/gltfExtractPrimitivesFromNode'
import { renameMaterialProperty } from '../utils'
import { ExpressionGroup } from './group'
import { ExpressionProxy } from './proxy'

/**
 * An importer that imports a [[VRMExpression]] from a VRM extension of a GLTF.
 */
export class ExpressionImporter {
  /**
   * Import a [[VRMExpression]] from a VRM.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   */
  public async import(loader: GLTFLoader): Promise<ExpressionProxy | null> {
    // const vrmExt: VRMSchema.VRM | undefined = gltf.parser.json.extensions?.VRM;
    const vrmExt: VRMSchema.VRM | undefined = loader.gltf.extensions?.VRM
    if (!vrmExt) {
      return null
    }
    console.log(vrmExt)

    const schemaExpression: VRMSchema.Expression | undefined = vrmExt.blendShapeMaster
    if (!schemaExpression) {
      return null
    }

    const expression = new ExpressionProxy()

    const expressionGroups: VRMSchema.ExpressionGroup[] | undefined = schemaExpression.blendShapeGroups
    if (!expressionGroups) {
      return expression
    }

    const expressionPresetMap: { [presetName in VRMSchema.ExpressionPresetName]?: string } = {}

    await Promise.all(
      expressionGroups.map(async schemaGroup => {
        const name = schemaGroup.name
        if (name === undefined) {
          console.warn('VRMExpressionImporter: One of expressionGroups has no name')
          return
        }

        let presetName: VRMSchema.ExpressionPresetName | undefined
        if (schemaGroup.presetName && schemaGroup.presetName !== VRMSchema.ExpressionPresetName.Unknown && !expressionPresetMap[schemaGroup.presetName]) {
          presetName = schemaGroup.presetName
          expressionPresetMap[schemaGroup.presetName] = name
        }

        const group = new ExpressionGroup(name)
        // gltf.scene.add(group);
        group.isBinary = schemaGroup.isBinary || false

        if (schemaGroup.binds) {
          schemaGroup.binds.forEach(async bind => {
            if (bind.mesh === undefined || bind.index === undefined) {
              return
            }

            const nodesUsingMesh: number[] = []
            ;(loader.gltf.nodes as GLTFSchema.Node[]).forEach((node, i) => {
              if (node.mesh === bind.mesh) {
                nodesUsingMesh.push(i)
              }
            })

            const morphTargetIndex = bind.index

            await Promise.all(
              nodesUsingMesh.map(async nodeIndex => {
                const primitives = (await gltfExtractPrimitivesFromNode(loader, nodeIndex))!

                // check if the mesh has the target morph target
                if (!primitives.every(primitive => Array.isArray(primitive.morphTargetManager?.influences) && morphTargetIndex < Array.from(primitive.morphTargetManager?.influences || []).length)) {
                  console.warn(`ExpressionImporter: ${schemaGroup.name} attempts to index ${morphTargetIndex}th morph but not found.`)
                  return
                }

                group.addBind({
                  meshes: primitives,
                  morphTargetIndex,
                  // weight: bind.weight ?? 100
                  weight: bind.weight ?? 100
                })
              })
            )
          })
        }

        const materialValues = schemaGroup.materialValues
        if (materialValues) {
          materialValues.forEach(materialValue => {
            if (materialValue.materialName === undefined || materialValue.propertyName === undefined || materialValue.targetValue === undefined) {
              return
            }

            const materials: BABYLON.Material[] = []
            // TODO: material
            // loader.babylonScene.getChildren().forEach(object => {
            //   if ((object as any).material) {
            //     const material: BABYLON.Material[] | BABYLON.Material = (object as any).material
            //     if (Array.isArray(material)) {
            //       materials.push(...material.filter(mtl => mtl.name === materialValue.materialName! && materials.indexOf(mtl) === -1))
            //     } else if (material.name === materialValue.materialName && materials.indexOf(material) === -1) {
            //       materials.push(material)
            //     }
            //   }
            // })

            materials.forEach(material => {
              group.addMaterialValue({
                material,
                propertyName: renameMaterialProperty(materialValue.propertyName!),
                targetValue: materialValue.targetValue!
              })
            })
          })
        }

        expression.registeExpressionGroup(name, presetName, group)
      })
    )

    return expression
  }
}

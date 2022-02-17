import * as BABYLON from '@babylonjs/core'
import { GLTFLoader, IGLTFLoaderExtension } from '@babylonjs/loaders/glTF/2.0'
import { GLTFFileLoader } from '@babylonjs/loaders/glTF/glTFFileLoader'
import { VRM } from './vrm'

export class VRMFileLoader extends GLTFFileLoader {
  public name = 'vrm'
  public extensions = {
    '.vrm': { isBinary: true }
  }

  public createPlugin() {
    return new VRMFileLoader()
  }
}

const NAME = 'VRM'

// gltf custom loader with some hooks
export class VRMExtensionLoader implements IGLTFLoaderExtension {
  /**
   * @inheritdoc
   */
  public readonly name = NAME
  /**
   * @inheritdoc
   */
  public enabled = true
  /**
   * This Mesh index and later are to be read
   */
  private meshesFrom = 0
  /**
   * This TransformNode index and later are read targets
   */
  private transformNodesFrom = 0

  /**
   * @inheritdoc
   */
  public constructor(private loader: GLTFLoader) {
    // GLTFLoader has already added rootMesh as __root__ before load extension
    // @see glTFLoader._loadData
    this.meshesFrom = this.loader.babylonScene.meshes.length - 1
    this.transformNodesFrom = this.loader.babylonScene.transformNodes.length
  }

  /**
   * @inheritdoc
   */
  public dispose(): void {
    ;(this.loader as any) = null
  }

  /**
   * @inheritdoc
   */
  public onReady() {
    if (!this.loader.gltf.extensions || !this.loader.gltf.extensions[NAME]) {
      return
    }
    const scene = this.loader.babylonScene
    VRM.from(this.loader).then(vrm => {
      scene.metadata = scene.metadata || {}
      scene.metadata.vrm = scene.metadata.vrm || []
      scene.metadata.vrm.push(vrm)

      this.loader.babylonScene.onDisposeObservable.add(() => {
        // Dispose VRM when Scene dispose
        vrm.dispose()
        this.loader.babylonScene.metadata.vrm = []
      })
    })
  }

  // public loadNodeAsync(context: string, node: INode, assign: (babylonMesh: TransformNode) => void): Promise<TransformNode> {
  //   return this.loader.loadNodeAsync(context, node, function (babylonMesh) {
  //     assign(babylonMesh);
  // });
  // }
  /**
   * @inheritdoc
   */
  // public _loadVertexDataAsync(
  //     context: string,
  //     primitive: IMeshPrimitive,
  //     babylonMesh: BABYLON.Mesh,
  // ) {
  //     if (!primitive.extras || !primitive.extras.targetNames) {
  //         return null;
  //     }
  //     // Since MorphTarget has not been generated yet, put the morph target information in the meta information.
  //     babylonMesh.metadata = babylonMesh.metadata || {};
  //     babylonMesh.metadata.vrmTargetNames = primitive.extras.targetNames;
  //     return null;
  // }

  // /**
  //  * @inheritdoc
  //  */
  // public _loadMaterialAsync(
  //     context: string,
  //     material: IMaterial,
  //     mesh: Mesh,
  //     babylonDrawMode: number,
  //     assign: (babylonMaterial: Material) => void,
  // ): Nullable<Promise<Material>> {
  //     // Generate material with generator
  //     return (new VRMMaterialGenerator(this.loader)).generate(context, material, mesh, babylonDrawMode, assign);
  // }
}

GLTFLoader.RegisterExtension(NAME, loader => {
  return new VRMExtensionLoader(loader)
})

if (BABYLON.SceneLoader) {
  BABYLON.SceneLoader.RegisterPlugin(new VRMFileLoader())
}

export * from './vrm'
export * from './importer'
// export * from './utils';
export * from './expression'
// export * from './debug';
export * from './firstPerson'
export * from './humanoid'
export * from './lookAt'
export * from './springBone'
export * from './types'
// export * from './material';
export * from './meta'

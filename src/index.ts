import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import { GLTFLoader, IGLTFLoaderExtension } from '@babylonjs/loaders/glTF/2.0'
import { GLTFFileLoader } from '@babylonjs/loaders/glTF/glTFFileLoader'
import { VRM } from './vrm'

export * from './vrm'
export * from './importer'
// export * from './VRMUtils';
// export * from './blendshape';
// export * from './debug';
// export * from './firstperson';
// export * from './humanoid';
// export * from './lookat';
// export * from './springbone';
// export * from './types';
// export * from './material';
export * from './meta'

export class VRMFileLoader extends GLTFFileLoader {
  public name = 'vrm'
  public extensions = {
    '.vrm': { isBinary: true }
  }

  public createPlugin() {
    return new VRMFileLoader()
  }
}

if (SceneLoader) {
  SceneLoader.RegisterPlugin(new VRMFileLoader())
}
const NAME = 'VRM'

export class VRMExt implements IGLTFLoaderExtension {
  /**
   * @inheritdoc
   */
  public readonly name = NAME
  /**
   * @inheritdoc
   */
  public enabled = true
  /**
   * この Mesh index 以降が読み込み対象
   */
  private meshesFrom = 0
  /**
   * この TransformNode index 以降が読み込み対象
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

      // const manager = new VRMManager(
      //     this.loader.gltf.extensions[NAME],
      //     this.loader.babylonScene,
      //     this.meshesFrom,
      //     this.transformNodesFrom,
      // );

      this.loader.babylonScene.onDisposeObservable.add(() => {
        // Scene dispose 時に Manager も破棄する
        vrm.dispose()
        this.loader.babylonScene.metadata.vrmManagers = []
      })
    })
  }

  // /**
  //  * @inheritdoc
  //  */
  // public _loadVertexDataAsync(
  //     context: string,
  //     primitive: IMeshPrimitive,
  //     babylonMesh: Mesh,
  // ) {
  //     if (!primitive.extras || !primitive.extras.targetNames) {
  //         return null;
  //     }
  //     // まだ MorphTarget が生成されていないので、メタ情報にモーフターゲット情報を入れておく
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
  //     // ジェネレータでマテリアルを生成する
  //     return (new VRMMaterialGenerator(this.loader)).generate(context, material, mesh, babylonDrawMode, assign);
  // }
}

GLTFLoader.RegisterExtension(NAME, loader => {
  // console.log(loader)
  // VRM.from(loader).then(vrm=>{
  //   console.log('vrm:%O', vrm)
  // })
  return new VRMExt(loader)
})

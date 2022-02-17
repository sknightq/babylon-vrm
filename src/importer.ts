import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0'
import { ExpressionImporter } from './expression/importer'
import { FirstPersonImporter } from './firstPerson/importer'
import { HumanoidImporter } from './humanoid/importer'
import { LookAtImporter } from './lookAt/importer'
// import { MaterialImporter } from './material/importer';
import { MetaImporter } from './meta/importer'
import { SpringBoneImporter } from './springBone/importer'
import { traverse } from './utils'
import { VRM } from './vrm'

export interface ImporterOptions {
  metaImporter?: MetaImporter
  lookAtImporter?: LookAtImporter
  humanoidImporter?: HumanoidImporter
  expressionImporter?: ExpressionImporter
  firstPersonImporter?: FirstPersonImporter
  // materialImporter?: MaterialImporter;
  springBoneImporter?: SpringBoneImporter
}

/**
 * An importer that imports a [[VRM]] from a VRM extension of a GLTF.
 */
export class Importer {
  protected readonly _metaImporter: MetaImporter
  protected readonly _expressionImporter: ExpressionImporter
  protected readonly _lookAtImporter: LookAtImporter
  protected readonly _humanoidImporter: HumanoidImporter
  protected readonly _firstPersonImporter: FirstPersonImporter
  // protected readonly _materialImporter: MaterialImporter;
  protected readonly _springBoneImporter: SpringBoneImporter

  /**
   * Create a new VRMImporter.
   *
   * @param options [[VRMImporterOptions]], optionally contains importers for each component
   */
  public constructor(options: ImporterOptions = {}) {
    this._metaImporter = options.metaImporter || new MetaImporter()
    this._expressionImporter = options.expressionImporter || new ExpressionImporter()
    this._lookAtImporter = options.lookAtImporter || new LookAtImporter()
    this._humanoidImporter = options.humanoidImporter || new HumanoidImporter()
    this._firstPersonImporter = options.firstPersonImporter || new FirstPersonImporter()
    // this._materialImporter = options.materialImporter || new MaterialImporter();
    this._springBoneImporter = options.springBoneImporter || new SpringBoneImporter()
  }

  /**
   * Receive a GLTF loader retrieved from `@babylonjs/loaders/glTF/2.0` and create a new [[VRM]] instance.
   *
   * @param loader A GLTFLoader which store the gltf object
   */
  public async import(loader: GLTFLoader): Promise<VRM> {
    if (loader.gltf.extensions === undefined || loader.gltf.extensions.VRM === undefined) {
      throw new Error('Could not find VRM extension on the GLTF')
    }
    // const scene = gltf.scene;
    // scene.updateMatrixWorld(false);

    // TODO: The frustumCulled of mesh will get rendered every frame even if it is not in the frustum of the camera. The Threejs default value is true to avioding external rendered.
    // Babylon set the defualt value will not passed to GPU, it's done CPU side.
    // ThreeJS: https://threejs.org/docs/?q=Object#api/zh/core/Object3D.frustumCulled
    // Babylonjs https://doc.babylonjs.com/divingDeeper/scene/optimize_your_scene#changing-mesh-culling-strategy

    // Skinned object should not be frustumCulled
    // Since pre-skinned position might be outside of view
    // scene.traverse((object3d) => {
    //   if ((object3d as any).isMesh) {
    //     object3d.frustumCulled = false;
    //   }
    // });

    const meta = (await this._metaImporter.import(loader)) || undefined

    // mToon动画材质
    // const materials = (await this._materialImporter.convertGLTFMaterials(loader)) || undefined;
    // https://github.com/virtual-cast/babylon-mtoon-material

    const humanoid = (await this._humanoidImporter.import(loader)) || undefined

    const firstPerson = humanoid ? (await this._firstPersonImporter.import(loader, humanoid)) || undefined : undefined

    const expressionProxy = (await this._expressionImporter.import(loader)) || undefined

    const lookAt = firstPerson && expressionProxy && humanoid ? (await this._lookAtImporter.import(loader, firstPerson, expressionProxy, humanoid)) || undefined : undefined

    const springBoneManager = (await this._springBoneImporter.import(loader)) || undefined

    return new VRM({
      scene: loader.babylonScene,
      meta,
      // materials,
      humanoid,
      firstPerson,
      expressionProxy,
      lookAt,
      springBoneManager
    })
  }
}

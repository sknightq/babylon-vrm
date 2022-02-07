
  
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';
import { BlendShapeImporter } from './blendShape/importer';
import { FirstPersonImporter } from './firstPerson/importer';
import { HumanoidImporter } from './humanoid/importer';
import { LookAtImporter } from './lookAt/importer';
import { MaterialImporter } from './material/importer';
import { MetaImporter } from './meta/importer';
import { SpringBoneImporter } from './springBone/importer';
import { VRM } from './vrm';

export interface ImporterOptions {
  metaImporter?: MetaImporter;
  lookAtImporter?: LookAtImporter;
  humanoidImporter?: HumanoidImporter;
  blendShapeImporter?: BlendShapeImporter;
  firstPersonImporter?: FirstPersonImporter;
  materialImporter?: MaterialImporter;
  springBoneImporter?: SpringBoneImporter;
}

/**
 * An importer that imports a [[VRM]] from a VRM extension of a GLTF.
 */
 export class Importer {
  protected readonly _metaImporter: MetaImporter;
  protected readonly _blendShapeImporter: BlendShapeImporter;
  protected readonly _lookAtImporter: LookAtImporter;
  protected readonly _humanoidImporter: HumanoidImporter;
  protected readonly _firstPersonImporter: FirstPersonImporter;
  protected readonly _materialImporter: MaterialImporter;
  protected readonly _springBoneImporter: SpringBoneImporter;

  /**
   * Create a new VRMImporter.
   *
   * @param options [[VRMImporterOptions]], optionally contains importers for each component
   */
  public constructor(options: ImporterOptions = {}) {
    this._metaImporter = options.metaImporter || new MetaImporter();
    this._blendShapeImporter = options.blendShapeImporter || new BlendShapeImporter();
    this._lookAtImporter = options.lookAtImporter || new LookAtImporter();
    this._humanoidImporter = options.humanoidImporter || new HumanoidImporter();
    this._firstPersonImporter = options.firstPersonImporter || new FirstPersonImporter();
    this._materialImporter = options.materialImporter || new MaterialImporter();
    this._springBoneImporter = options.springBoneImporter || new SpringBoneImporter();
  }

  /**
   * Receive a GLTF object retrieved from `THREE.GLTFLoader` and create a new [[VRM]] instance.
   *
   * @param gltf A parsed result of GLTF taken from GLTFLoader
   */
  public async import(loader: GLTFLoader): Promise<VRM> {
    if (loader.gltf.extensions === undefined || loader.gltf.extensions.VRM === undefined) {
      throw new Error('Could not find VRM extension on the GLTF');
    }
    // const scene = gltf.scene;

    // scene.updateMatrixWorld(false);

    // // Skinned object should not be frustumCulled
    // // Since pre-skinned position might be outside of view
    // scene.traverse((object3d) => {
    //   if ((object3d as any).isMesh) {
    //     object3d.frustumCulled = false;
    //   }
    // });

    const meta = (await this._metaImporter.import(loader)) || undefined;

    // const materials = (await this._materialImporter.convertGLTFMaterials(gltf)) || undefined;

    // const humanoid = (await this._humanoidImporter.import(gltf)) || undefined;

    // const firstPerson = humanoid ? (await this._firstPersonImporter.import(gltf, humanoid)) || undefined : undefined;

    // const blendShapeProxy = (await this._blendShapeImporter.import(gltf)) || undefined;

    // const lookAt =
    //   firstPerson && blendShapeProxy && humanoid
    //     ? (await this._lookAtImporter.import(gltf, firstPerson, blendShapeProxy, humanoid)) || undefined
    //     : undefined;

    // const springBoneManager = (await this._springBoneImporter.import(gltf)) || undefined;

    return new VRM({
      scene: loader.babylonScene,
      meta,
      // materials,
      // humanoid,
      // firstPerson,
      // blendShapeProxy,
      // lookAt,
      // springBoneManager,
    });
  }
}
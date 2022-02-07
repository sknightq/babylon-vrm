import * as BABYLON from '@babylonjs/core';
import { VRMSchema } from '../types';
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';
import { Meta } from './index';
import { Options } from './options';

/**
 * An importer that imports a {@link VRMMeta} from a VRM extension of a GLTF.
 */
export class MetaImporter {
  /**
   * If `true`, it won't load its thumbnail texture ({@link VRMMeta.texture}). `false` by default.
   */
  public ignoreTexture: boolean;

  constructor(options?: Options) {
    this.ignoreTexture = options?.ignoreTexture ?? false;
  }

  public async import(loader: GLTFLoader): Promise<Meta | null> {
    console.log(loader)
    // const vrmExt: VRMSchema.VRM | undefined = gltf.parent.extensions.VRM;
    const vrmExt: VRMSchema.VRM | undefined = loader.gltf.extensions.VRM;
    if (!vrmExt) {
      return null;
    }

    const schemaMeta: VRMSchema.Meta | undefined = vrmExt.meta;
    if (!schemaMeta) {
      return null;
    }

    // let texture: BABYLON.Texture | null | undefined;
    // if (!this.ignoreTexture && schemaMeta.texture != null && schemaMeta.texture !== -1) {
    //   texture = await gltf.parser.getDependency('texture', schemaMeta.texture);
    // }

    return {
      allowedUserName: schemaMeta.allowedUserName,
      author: schemaMeta.author,
      commercialUssageName: schemaMeta.commercialUssageName,
      contactInformation: schemaMeta.contactInformation,
      licenseName: schemaMeta.licenseName,
      otherLicenseUrl: schemaMeta.otherLicenseUrl,
      otherPermissionUrl: schemaMeta.otherPermissionUrl,
      reference: schemaMeta.reference,
      sexualUssageName: schemaMeta.sexualUssageName,
      texture: undefined,
      title: schemaMeta.title,
      version: schemaMeta.version,
      violentUssageName: schemaMeta.violentUssageName,
    };
  }
}
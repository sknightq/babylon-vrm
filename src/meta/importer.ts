import * as BABYLON from '@babylonjs/core';
import { VRMSchema } from '../types';
import { GLTFLoader,ITexture } from '@babylonjs/loaders/glTF/2.0';
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
  
    const vrmExt: VRMSchema.VRM | undefined = loader.gltf.extensions?.VRM;
    if (!vrmExt) {
      return null;
    }

    const schemaMeta: VRMSchema.Meta | undefined = vrmExt.meta;
    if (!schemaMeta) {
      return null;
    }

    // NOTE: The thumbnailImage instead of texture
    // let texture: number| null | undefined;
    // if (!this.ignoreTexture && schemaMeta.texture !== null && schemaMeta.texture !== -1 && loader.gltf.textures?.length) {
    //   texture = loader.gltf.textures[schemaMeta.texture as number]
    // }
    // TODO: modify the property of return by vrm-1.0
    // https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm-1.0-beta/meta.md
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
      texture: schemaMeta.texture,
      title: schemaMeta.title,
      version: schemaMeta.version,
      violentUssageName: schemaMeta.violentUssageName,
    };
  }
}

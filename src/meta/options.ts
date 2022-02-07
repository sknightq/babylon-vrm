/**
 * Options for a {@link importer} instance.
 */
 export interface Options {
  /**
   * If `true`, it won't load its thumbnail texture ({@link Meta.texture}). `false` by default.
   */
  ignoreTexture?: boolean;
}
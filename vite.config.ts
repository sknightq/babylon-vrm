import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'babylon-vrm',
      fileName: format => `babylon-vrm.${format}.js`
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['@babylonjs/core', '@babylonjs/loaders/glTF/2.0', '@babylonjs/loaders/glTF/glTFFileLoader'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          '@babylonjs/core': 'BABYLON',
          '@babylonjs/loaders/glTF/2.0': 'GLTFL2',
          '@babylonjs/loaders/glTF/glTFFileLoader': 'FileLoader'
        }
      }
    }
  }
})

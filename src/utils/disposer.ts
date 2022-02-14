// See: https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects

import * as BABYLON from '@babylonjs/core';
import { traverse } from './traverse';

function disposeMaterial(material: BABYLON.Material): void {
  Object.keys(material).forEach((propertyName) => {
    const value = (material as any)[propertyName];
    if (value?.isTexture) {
      const texture = value as BABYLON.Texture;
      texture.dispose();
    }
  });

  material.dispose();
}

function dispose(node: BABYLON.Node): void {
  const geometry: BABYLON.Geometry | undefined = (node as any).geometry;
  if (geometry) {
    geometry.dispose();
  }

  const material: BABYLON.Material | BABYLON.Material[] = (node as any).material;
  if (material) {
    if (Array.isArray(material)) {
      material.forEach((material: BABYLON.Material) => disposeMaterial(material));
    } else if (material) {
      disposeMaterial(material);
    }
  }
}

export function deepDispose(object: BABYLON.Node): void {
  traverse(object, dispose);
}

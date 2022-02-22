import * as BABYLON from '@babylonjs/core'
export function traverse(current: BABYLON.Node, callback: (node: BABYLON.Node) => void) {
  callback(current)
  const children = current.getChildren()
  for (let i = 0; i < children.length; i++) {
    traverse(children[i], callback)
  }
}

/**
 * Updates a quaternion so that it rotates vector vecFrom to vector vecTo
 * @param vecFrom defines the direction vector from which to rotate
 * @param vecTo defines the direction vector to which to rotate
 * @param result the quaternion to store the result
 * @returns the updated quaternion
 */
export function fromUnitVectorsToRef(vecFrom: BABYLON.Vector3, vecTo: BABYLON.Vector3, result: BABYLON.Quaternion) {
  const r = BABYLON.Vector3.Dot(vecFrom, vecTo) + 1

  if (r < BABYLON.Epsilon) {
    if (Math.abs(vecFrom.x) > Math.abs(vecFrom.z)) {
      result.set(-vecFrom.y, vecFrom.x, 0, 0)
    } else {
      result.set(0, -vecFrom.z, vecFrom.y, 0)
    }
  } else {
    BABYLON.Vector3.CrossToRef(vecFrom, vecTo, BABYLON.TmpVectors.Vector3[0])
    result.set(BABYLON.TmpVectors.Vector3[0].x, BABYLON.TmpVectors.Vector3[0].y, BABYLON.TmpVectors.Vector3[0].z, r)
  }

  return result.normalize()
}


/** 
 * Multiply the quaternion by a vector to result 
 * @param quaternion defines quaternion
 * @param vector defines vector
 * @param result the vector to store the result
 */
export function multiplyQuaternionByVectorToRef(quaternion: BABYLON.Quaternion, vector: BABYLON.Vector3, result: BABYLON.Vector3): void {
  // Vector
  const x: number = vector.x
  const y: number = vector.y
  const z: number = vector.z
  // Quaternion
  const qx: number = quaternion.x
  const qy: number = quaternion.y
  const qz: number = quaternion.z
  const qw: number = quaternion.w
  // Quaternion * Vector
  const ix: number = qw * x + qy * z - qz * y
  const iy: number = qw * y + qz * x - qx * z
  const iz: number = qw * z + qx * y - qy * x
  const iw: number = -qx * x - qy * y - qz * z
  // Final Quaternion * Vector = Result
  result.x = ix * qw + iw * -qx + iy * -qz - iz * -qy
  result.y = iy * qw + iw * -qy + iz * -qx - ix * -qz
  result.z = iz * qw + iw * -qz + ix * -qy - iy * -qx
}

function disposeMaterial(material: BABYLON.Material): void {
  Object.keys(material).forEach(propertyName => {
    const value = (material as any)[propertyName]
    if (value?.isTexture) {
      const texture = value as BABYLON.Texture
      texture.dispose()
    }
  })

  material.dispose()
}

function dispose(node: BABYLON.Node): void {
  const geometry: BABYLON.Geometry | undefined = (node as any).geometry
  if (geometry) {
    geometry.dispose()
  }

  const material: BABYLON.Material | BABYLON.Material[] = (node as any).material
  if (material) {
    if (Array.isArray(material)) {
      material.forEach((material: BABYLON.Material) => disposeMaterial(material))
    } else if (material) {
      disposeMaterial(material)
    }
  }
}

export function deepDispose(object: BABYLON.Node): void {
  traverse(object, dispose)
}

export function renameMaterialProperty(name: string): string {
  if (name[0] !== '_') {
    console.warn(`renameMaterialProperty: Given property name "${name}" might be invalid`)
    return name
  }
  name = name.substring(1)

  if (!/[A-Z]/.test(name[0])) {
    console.warn(`renameMaterialProperty: Given property name "${name}" might be invalid`)
    return name
  }
  return name[0].toLowerCase() + name.substring(1)
}

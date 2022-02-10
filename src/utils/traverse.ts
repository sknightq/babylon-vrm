import * as BABYLON from '@babylonjs/core'
export function traverse(current: BABYLON.Node, callback: (node: BABYLON.Node) => void) {
  callback(current)
  const children = current.getChildren()
  for (let i = 0; i < children.length; i++) {
    traverse(children[i], callback)
  }
}

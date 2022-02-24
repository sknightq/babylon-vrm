import * as BABYLON from '@babylonjs/core'
import { GLTFLoader, INode, IMesh } from '@babylonjs/loaders/glTF/2.0'
import { traverse } from './index'

function extractPrimitivesInternal(loader: GLTFLoader, nodeIndex: number, node: BABYLON.TransformNode): GLTFPrimitive[] | null {
  /**
   * Let's list up every possible patterns that parsed gltf nodes with a mesh can have,,,
   *
   * "*" indicates that those meshes should be listed up using this function
   *
   * ### A node with a (mesh, a signle primitive)
   *
   * - `THREE.Mesh`: The only primitive of the mesh *
   *
   * ### A node with a (mesh, multiple primitives)
   *
   * - `THREE.Group`: The root of the mesh
   *   - `THREE.Mesh`: A primitive of the mesh *
   *   - `THREE.Mesh`: A primitive of the mesh (2) *
   *
   * ### A node with a (mesh, multiple primitives) AND (a child with a mesh, a single primitive)
   *
   * - `THREE.Group`: The root of the mesh
   *   - `THREE.Mesh`: A primitive of the mesh *
   *   - `THREE.Mesh`: A primitive of the mesh (2) *
   *   - `THREE.Mesh`: A primitive of a MESH OF THE CHILD
   *
   * ### A node with a (mesh, multiple primitives) AND (a child with a mesh, multiple primitives)
   *
   * - `THREE.Group`: The root of the mesh
   *   - `THREE.Mesh`: A primitive of the mesh *
   *   - `THREE.Mesh`: A primitive of the mesh (2) *
   *   - `THREE.Group`: The root of a MESH OF THE CHILD
   *     - `THREE.Mesh`: A primitive of the mesh of the child
   *     - `THREE.Mesh`: A primitive of the mesh of the child (2)
   *
   * ### A node with a (mesh, multiple primitives) BUT the node is a bone
   *
   * - `THREE.Bone`: The root of the node, as a bone
   *   - `THREE.Group`: The root of the mesh
   *     - `THREE.Mesh`: A primitive of the mesh *
   *     - `THREE.Mesh`: A primitive of the mesh (2) *
   *
   * ### A node with a (mesh, multiple primitives) AND (a child with a mesh, multiple primitives) BUT the node is a bone
   *
   * - `THREE.Bone`: The root of the node, as a bone
   *   - `THREE.Group`: The root of the mesh
   *     - `THREE.Mesh`: A primitive of the mesh *
   *     - `THREE.Mesh`: A primitive of the mesh (2) *
   *   - `THREE.Group`: The root of a MESH OF THE CHILD
   *     - `THREE.Mesh`: A primitive of the mesh of the child
   *     - `THREE.Mesh`: A primitive of the mesh of the child (2)
   *
   * ...I will take a strategy that traverses the root of the node and take first (primitiveCount) meshes.
   */

  // Make sure that the node has a mesh
  const schemaNode: INode = (loader.gltf.nodes as INode[])[nodeIndex]
  const meshIndex = schemaNode.mesh
  if (meshIndex == null) {
    return null
  }

  // How many primitives the mesh has?
  const schemaMesh: IMesh = (loader.gltf.meshes as IMesh[])[meshIndex]
  const primitiveCount = schemaMesh.primitives.length

  // Traverse the node and take first (primitiveCount) meshes
  const primitives: BABYLON.Mesh[] = []
  traverse(node._babylonTransformNode as BABYLON.Node, object => {
    if (primitives.length < primitiveCount) {
      if ((object as BABYLON.Mesh)._isMesh) {
        // TODO: Maybe change the type of primitives
        primitives.push(object as BABYLON.Mesh)
      }
    }
  })

  return primitives
}

/**
 * Extract primitives ( `BABYLON.Mesh[]` ) of a node from a loaded GLTF.
 * The main purpose of this function is to distinguish primitives and children from a node that has both meshes and children.
 *
 * It utilizes the behavior that GLTFLoader adds mesh primitives to the node object ( `THREE.Group` ) first then adds its children.
 *
 * @param gltf A GLTF object taken from GLTFLoader
 * @param nodeIndex The index of the node
 */
export async function gltfExtractPrimitivesFromNode(loader: GLTFLoader, nodeIndex: number): Promise<BABYLON.Mesh[] | null> {
  const node: INode = (loader.gltf.nodes as INode[])[nodeIndex]
  return extractPrimitivesInternal(loader, nodeIndex, node)
}

/**
 * Extract primitives ( `BABYLON.Mesh[]` ) of nodes from a loaded GLTF.
 * See {@link gltfExtractPrimitivesFromNode} for more details.
 *
 * It returns a map from node index to extraction result.
 * If a node does not have a mesh, the entry for the node will not be put in the returning map.
 *
 * @param gltf A GLTF object taken from GLTFLoader
 */
export async function gltfExtractPrimitivesFromNodes(loader: GLTFLoader): Promise<Map<number, BABYLON.Mesh[]>> {
  const nodes: INode[] = loader.gltf.nodes as INode[]
  const map = new Map<number, BABYLON.Mesh[]>()

  nodes.forEach((node, index) => {
    const result = extractPrimitivesInternal(loader, index, node)
    if (result != null) {
      map.set(index, result)
    }
  })

  return map
}

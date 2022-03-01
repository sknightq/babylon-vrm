import * as BABYLON from "@babylonjs/core";
import { Matrix } from "@babylonjs/core";
import { GLTFLoader } from "@babylonjs/loaders/glTF/2.0";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF/glTFFileLoader";
function traverse(current, callback) {
  callback(current);
  const children = current.getChildren();
  for (let i = 0; i < children.length; i++) {
    traverse(children[i], callback);
  }
}
function fromUnitVectorsToRef(vecFrom, vecTo, result) {
  const r = BABYLON.Vector3.Dot(vecFrom, vecTo) + 1;
  if (r < BABYLON.Epsilon) {
    if (Math.abs(vecFrom.x) > Math.abs(vecFrom.z)) {
      result.set(-vecFrom.y, vecFrom.x, 0, 0);
    } else {
      result.set(0, -vecFrom.z, vecFrom.y, 0);
    }
  } else {
    BABYLON.Vector3.CrossToRef(vecFrom, vecTo, BABYLON.TmpVectors.Vector3[0]);
    result.set(BABYLON.TmpVectors.Vector3[0].x, BABYLON.TmpVectors.Vector3[0].y, BABYLON.TmpVectors.Vector3[0].z, r);
  }
  return result.normalize();
}
function multiplyQuaternionByVectorToRef(quaternion, vector, result) {
  const x = vector.x;
  const y = vector.y;
  const z = vector.z;
  const qx = quaternion.x;
  const qy = quaternion.y;
  const qz = quaternion.z;
  const qw = quaternion.w;
  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;
  result.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  result.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  result.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
}
function disposeMaterial(material) {
  Object.keys(material).forEach((propertyName) => {
    const value = material[propertyName];
    if (value == null ? void 0 : value.isTexture) {
      const texture = value;
      texture.dispose();
    }
  });
  material.dispose();
}
function dispose(node) {
  const geometry = node.geometry;
  if (geometry) {
    geometry.dispose();
  }
  const material = node.material;
  if (material) {
    if (Array.isArray(material)) {
      material.forEach((material2) => disposeMaterial(material2));
    } else if (material) {
      disposeMaterial(material);
    }
  }
}
function deepDispose(object) {
  traverse(object, dispose);
}
function renameMaterialProperty(name) {
  if (name[0] !== "_") {
    console.warn(`renameMaterialProperty: Given property name "${name}" might be invalid`);
    return name;
  }
  name = name.substring(1);
  if (!/[A-Z]/.test(name[0])) {
    console.warn(`renameMaterialProperty: Given property name "${name}" might be invalid`);
    return name;
  }
  return name[0].toLowerCase() + name.substring(1);
}
var VRMSchema;
((VRMSchema2) => {
  ((ExpressionPresetName2) => {
    ExpressionPresetName2["A"] = "a";
    ExpressionPresetName2["Angry"] = "angry";
    ExpressionPresetName2["Blink"] = "blink";
    ExpressionPresetName2["BlinkL"] = "blink_l";
    ExpressionPresetName2["BlinkR"] = "blink_r";
    ExpressionPresetName2["E"] = "e";
    ExpressionPresetName2["Fun"] = "fun";
    ExpressionPresetName2["I"] = "i";
    ExpressionPresetName2["Joy"] = "joy";
    ExpressionPresetName2["Lookdown"] = "lookdown";
    ExpressionPresetName2["Lookleft"] = "lookleft";
    ExpressionPresetName2["Lookright"] = "lookright";
    ExpressionPresetName2["Lookup"] = "lookup";
    ExpressionPresetName2["Neutral"] = "neutral";
    ExpressionPresetName2["O"] = "o";
    ExpressionPresetName2["Sorrow"] = "sorrow";
    ExpressionPresetName2["U"] = "u";
    ExpressionPresetName2["Unknown"] = "unknown";
  })(VRMSchema2.ExpressionPresetName || (VRMSchema2.ExpressionPresetName = {}));
  ((FirstPersonLookAtTypeName2) => {
    FirstPersonLookAtTypeName2["Expression"] = "Expression";
    FirstPersonLookAtTypeName2["Bone"] = "Bone";
  })(VRMSchema2.FirstPersonLookAtTypeName || (VRMSchema2.FirstPersonLookAtTypeName = {}));
  ((HumanoidBoneName2) => {
    HumanoidBoneName2["Chest"] = "chest";
    HumanoidBoneName2["Head"] = "head";
    HumanoidBoneName2["Hips"] = "hips";
    HumanoidBoneName2["Jaw"] = "jaw";
    HumanoidBoneName2["LeftEye"] = "leftEye";
    HumanoidBoneName2["LeftFoot"] = "leftFoot";
    HumanoidBoneName2["LeftHand"] = "leftHand";
    HumanoidBoneName2["LeftIndexDistal"] = "leftIndexDistal";
    HumanoidBoneName2["LeftIndexIntermediate"] = "leftIndexIntermediate";
    HumanoidBoneName2["LeftIndexProximal"] = "leftIndexProximal";
    HumanoidBoneName2["LeftLittleDistal"] = "leftLittleDistal";
    HumanoidBoneName2["LeftLittleIntermediate"] = "leftLittleIntermediate";
    HumanoidBoneName2["LeftLittleProximal"] = "leftLittleProximal";
    HumanoidBoneName2["LeftLowerArm"] = "leftLowerArm";
    HumanoidBoneName2["LeftLowerLeg"] = "leftLowerLeg";
    HumanoidBoneName2["LeftMiddleDistal"] = "leftMiddleDistal";
    HumanoidBoneName2["LeftMiddleIntermediate"] = "leftMiddleIntermediate";
    HumanoidBoneName2["LeftMiddleProximal"] = "leftMiddleProximal";
    HumanoidBoneName2["LeftRingDistal"] = "leftRingDistal";
    HumanoidBoneName2["LeftRingIntermediate"] = "leftRingIntermediate";
    HumanoidBoneName2["LeftRingProximal"] = "leftRingProximal";
    HumanoidBoneName2["LeftShoulder"] = "leftShoulder";
    HumanoidBoneName2["LeftThumbDistal"] = "leftThumbDistal";
    HumanoidBoneName2["LeftThumbIntermediate"] = "leftThumbIntermediate";
    HumanoidBoneName2["LeftThumbProximal"] = "leftThumbProximal";
    HumanoidBoneName2["LeftToes"] = "leftToes";
    HumanoidBoneName2["LeftUpperArm"] = "leftUpperArm";
    HumanoidBoneName2["LeftUpperLeg"] = "leftUpperLeg";
    HumanoidBoneName2["Neck"] = "neck";
    HumanoidBoneName2["RightEye"] = "rightEye";
    HumanoidBoneName2["RightFoot"] = "rightFoot";
    HumanoidBoneName2["RightHand"] = "rightHand";
    HumanoidBoneName2["RightIndexDistal"] = "rightIndexDistal";
    HumanoidBoneName2["RightIndexIntermediate"] = "rightIndexIntermediate";
    HumanoidBoneName2["RightIndexProximal"] = "rightIndexProximal";
    HumanoidBoneName2["RightLittleDistal"] = "rightLittleDistal";
    HumanoidBoneName2["RightLittleIntermediate"] = "rightLittleIntermediate";
    HumanoidBoneName2["RightLittleProximal"] = "rightLittleProximal";
    HumanoidBoneName2["RightLowerArm"] = "rightLowerArm";
    HumanoidBoneName2["RightLowerLeg"] = "rightLowerLeg";
    HumanoidBoneName2["RightMiddleDistal"] = "rightMiddleDistal";
    HumanoidBoneName2["RightMiddleIntermediate"] = "rightMiddleIntermediate";
    HumanoidBoneName2["RightMiddleProximal"] = "rightMiddleProximal";
    HumanoidBoneName2["RightRingDistal"] = "rightRingDistal";
    HumanoidBoneName2["RightRingIntermediate"] = "rightRingIntermediate";
    HumanoidBoneName2["RightRingProximal"] = "rightRingProximal";
    HumanoidBoneName2["RightShoulder"] = "rightShoulder";
    HumanoidBoneName2["RightThumbDistal"] = "rightThumbDistal";
    HumanoidBoneName2["RightThumbIntermediate"] = "rightThumbIntermediate";
    HumanoidBoneName2["RightThumbProximal"] = "rightThumbProximal";
    HumanoidBoneName2["RightToes"] = "rightToes";
    HumanoidBoneName2["RightUpperArm"] = "rightUpperArm";
    HumanoidBoneName2["RightUpperLeg"] = "rightUpperLeg";
    HumanoidBoneName2["Spine"] = "spine";
    HumanoidBoneName2["UpperChest"] = "upperChest";
  })(VRMSchema2.HumanoidBoneName || (VRMSchema2.HumanoidBoneName = {}));
  ((MetaAllowedUserName2) => {
    MetaAllowedUserName2["Everyone"] = "Everyone";
    MetaAllowedUserName2["ExplicitlyLicensedPerson"] = "ExplicitlyLicensedPerson";
    MetaAllowedUserName2["OnlyAuthor"] = "OnlyAuthor";
  })(VRMSchema2.MetaAllowedUserName || (VRMSchema2.MetaAllowedUserName = {}));
  ((MetaUssageName2) => {
    MetaUssageName2["Allow"] = "Allow";
    MetaUssageName2["Disallow"] = "Disallow";
  })(VRMSchema2.MetaUssageName || (VRMSchema2.MetaUssageName = {}));
  ((MetaLicenseName2) => {
    MetaLicenseName2["Cc0"] = "CC0";
    MetaLicenseName2["CcBy"] = "CC_BY";
    MetaLicenseName2["CcByNc"] = "CC_BY_NC";
    MetaLicenseName2["CcByNcNd"] = "CC_BY_NC_ND";
    MetaLicenseName2["CcByNcSa"] = "CC_BY_NC_SA";
    MetaLicenseName2["CcByNd"] = "CC_BY_ND";
    MetaLicenseName2["CcBySa"] = "CC_BY_SA";
    MetaLicenseName2["Other"] = "Other";
    MetaLicenseName2["RedistributionProhibited"] = "Redistribution_Prohibited";
  })(VRMSchema2.MetaLicenseName || (VRMSchema2.MetaLicenseName = {}));
})(VRMSchema || (VRMSchema = {}));
function extractPrimitivesInternal(loader, nodeIndex, node) {
  const schemaNode = loader.gltf.nodes[nodeIndex];
  const meshIndex = schemaNode.mesh;
  if (meshIndex == null) {
    return null;
  }
  const schemaMesh = loader.gltf.meshes[meshIndex];
  const primitiveCount = schemaMesh.primitives.length;
  const primitives = [];
  traverse(node._babylonTransformNode, (object) => {
    if (primitives.length < primitiveCount) {
      if (object._isMesh) {
        primitives.push(object);
      }
    }
  });
  return primitives;
}
async function gltfExtractPrimitivesFromNode(loader, nodeIndex) {
  const node = loader.gltf.nodes[nodeIndex];
  return extractPrimitivesInternal(loader, nodeIndex, node);
}
async function gltfExtractPrimitivesFromNodes(loader) {
  const nodes = loader.gltf.nodes;
  const map = /* @__PURE__ */ new Map();
  nodes.forEach((node, index) => {
    const result = extractPrimitivesInternal(loader, index, node);
    if (result != null) {
      map.set(index, result);
    }
  });
  return map;
}
const _v2 = new BABYLON.Vector2();
const _v3 = new BABYLON.Vector3();
const _v4 = new BABYLON.Quaternion();
const _color = new BABYLON.Color3();
class ExpressionGroup extends BABYLON.TransformNode {
  constructor(expressionName) {
    super(`${expressionName}`);
    this.weight = 0;
    this.isBinary = false;
    this._binds = [];
    this._materialValues = [];
    this.name = `ExpressionController_${expressionName}`;
    this.type = "ExpressionController";
    this.setEnabled(false);
  }
  addBind(args) {
    const weight = args.weight / 100;
    this._binds.push({
      meshes: args.meshes,
      morphTargetIndex: args.morphTargetIndex,
      weight
    });
  }
  addMaterialValue(args) {
    const material = args.material;
    const propertyName = args.propertyName;
    let value = material[propertyName];
    if (!value) {
      return;
    }
    value = args.defaultValue || value;
    let type;
    let defaultValue;
    let targetValue;
    let deltaValue;
    if (value.isVector2) {
      type = 1;
      defaultValue = value.clone();
      targetValue = new BABYLON.Vector2().fromArray(args.targetValue);
      deltaValue = targetValue.clone().subtract(defaultValue);
    } else if (value.isVector3) {
      type = 2;
      defaultValue = value.clone();
      targetValue = new BABYLON.Vector3().fromArray(args.targetValue);
      deltaValue = targetValue.clone().subtract(defaultValue);
    } else if (value.isVector4) {
      type = 3;
      defaultValue = value.clone();
      targetValue = BABYLON.Quaternion.FromArray([args.targetValue[2], args.targetValue[3], args.targetValue[0], args.targetValue[1]]);
      deltaValue = targetValue.clone().subtract(defaultValue);
    } else if (value.isColor) {
      type = 4;
      defaultValue = value.clone();
      targetValue = new BABYLON.Color3().fromArray(args.targetValue);
      deltaValue = targetValue.clone().subtract(defaultValue);
    } else {
      type = 0;
      defaultValue = value;
      targetValue = args.targetValue[0];
      deltaValue = targetValue - defaultValue;
    }
    this._materialValues.push({
      material,
      propertyName,
      defaultValue,
      targetValue,
      deltaValue,
      type
    });
  }
  applyWeight() {
    const w = this.isBinary ? this.weight < 0.5 ? 0 : 1 : this.weight;
    this._binds.forEach((bind) => {
      bind.meshes.forEach((mesh) => {
        const morphTargetsManager = mesh.morphTargetManager;
        if (!morphTargetsManager) {
          return;
        }
        morphTargetsManager.getTarget(bind.morphTargetIndex).influence += w * bind.weight;
      });
    });
    this._materialValues.forEach((materialValue) => {
      const prop = materialValue.material[materialValue.propertyName];
      if (prop === void 0) {
        return;
      }
      if (materialValue.type === 0) {
        const deltaValue = materialValue.deltaValue;
        materialValue.material[materialValue.propertyName] += deltaValue * w;
      } else if (materialValue.type === 1) {
        const deltaValue = materialValue.deltaValue;
        materialValue.material[materialValue.propertyName].add(_v2.copyFrom(deltaValue).multiplyByFloats(w, w));
      } else if (materialValue.type === 2) {
        const deltaValue = materialValue.deltaValue;
        materialValue.material[materialValue.propertyName].add(_v3.copyFrom(deltaValue).multiplyByFloats(w, w, w));
      } else if (materialValue.type === 3) {
        const multiplyDeltaValue = BABYLON.Quaternion.FromArray([
          materialValue.deltaValue[0] * w,
          materialValue.deltaValue[1] * w,
          materialValue.deltaValue[2] * w,
          materialValue.deltaValue[3] * w
        ]);
        materialValue.material[materialValue.propertyName].add(_v4.copyFrom(multiplyDeltaValue));
      } else if (materialValue.type === 4) {
        const multiplyDeltaValue = BABYLON.Color3.FromArray([materialValue.deltaValue[0] * w, materialValue.deltaValue[1] * w, materialValue.deltaValue[2] * w]);
        materialValue.material[materialValue.propertyName].add(_color.copyFrom(multiplyDeltaValue));
      }
      if (typeof materialValue.material.shouldApplyUniforms === "boolean") {
        materialValue.material.shouldApplyUniforms = true;
      }
    });
  }
  clearAppliedWeight() {
    this._binds.forEach((bind) => {
      bind.meshes.forEach((mesh) => {
        const morphTargetsManager = mesh.morphTargetManager;
        if (!morphTargetsManager) {
          return;
        }
        morphTargetsManager.getTarget(bind.morphTargetIndex).influence = 0;
      });
    });
    this._materialValues.forEach((materialValue) => {
      const prop = materialValue.material[materialValue.propertyName];
      if (prop === void 0) {
        return;
      }
      if (materialValue.type === 0) {
        const defaultValue = materialValue.defaultValue;
        materialValue.material[materialValue.propertyName] = defaultValue;
      } else if (materialValue.type === 1) {
        const defaultValue = materialValue.defaultValue;
        materialValue.material[materialValue.propertyName].copy(defaultValue);
      } else if (materialValue.type === 2) {
        const defaultValue = materialValue.defaultValue;
        materialValue.material[materialValue.propertyName].copy(defaultValue);
      } else if (materialValue.type === 3) {
        const defaultValue = materialValue.defaultValue;
        materialValue.material[materialValue.propertyName].copy(defaultValue);
      } else if (materialValue.type === 4) {
        const defaultValue = materialValue.defaultValue;
        materialValue.material[materialValue.propertyName].copy(defaultValue);
      }
      if (typeof materialValue.material.shouldApplyUniforms === "boolean") {
        materialValue.material.shouldApplyUniforms = true;
      }
    });
  }
}
class ExpressionProxy {
  constructor() {
    this._expressionGroups = {};
    this._expressionPresetMap = {};
    this._unknownGroupNames = [];
  }
  get expressions() {
    return Object.keys(this._expressionGroups);
  }
  get expressionPresetMap() {
    return this._expressionPresetMap;
  }
  get unknownGroupNames() {
    return this._unknownGroupNames;
  }
  getExpressionGroup(name) {
    const presetName = this._expressionPresetMap[name];
    const controller = presetName ? this._expressionGroups[presetName] : this._expressionGroups[name];
    if (!controller) {
      console.warn(`no expression found by ${name}`);
      return void 0;
    }
    return controller;
  }
  registeExpressionGroup(name, presetName, controller) {
    this._expressionGroups[name] = controller;
    if (presetName) {
      this._expressionPresetMap[presetName] = name;
    } else {
      this._unknownGroupNames.push(name);
    }
  }
  getValue(name) {
    var _a;
    const controller = this.getExpressionGroup(name);
    return (_a = controller == null ? void 0 : controller.weight) != null ? _a : null;
  }
  setValue(name, weight) {
    const controller = this.getExpressionGroup(name);
    if (controller) {
      controller.weight = Math.max(Math.min(weight, 1), 0);
    }
  }
  getExpressionTrackName(name) {
    const controller = this.getExpressionGroup(name);
    return controller ? `${controller.name}.weight` : null;
  }
  update() {
    Object.keys(this._expressionGroups).forEach((name) => {
      const controller = this._expressionGroups[name];
      controller.clearAppliedWeight();
    });
    Object.keys(this._expressionGroups).forEach((name) => {
      const controller = this._expressionGroups[name];
      controller.applyWeight();
    });
  }
}
class ExpressionImporter {
  async import(loader) {
    var _a;
    const vrmExt = (_a = loader.gltf.extensions) == null ? void 0 : _a.VRM;
    if (!vrmExt) {
      return null;
    }
    const schemaExpression = vrmExt.blendShapeMaster;
    if (!schemaExpression) {
      return null;
    }
    const expression = new ExpressionProxy();
    const expressionGroups = schemaExpression.blendShapeGroups;
    if (!expressionGroups) {
      return expression;
    }
    const expressionPresetMap = {};
    await Promise.all(expressionGroups.map(async (schemaGroup) => {
      const name = schemaGroup.name;
      if (name === void 0) {
        console.warn("VRMExpressionImporter: One of expressionGroups has no name");
        return;
      }
      let presetName;
      if (schemaGroup.presetName && schemaGroup.presetName !== VRMSchema.ExpressionPresetName.Unknown && !expressionPresetMap[schemaGroup.presetName]) {
        presetName = schemaGroup.presetName;
        expressionPresetMap[schemaGroup.presetName] = name;
      }
      const group = new ExpressionGroup(name);
      group.isBinary = schemaGroup.isBinary || false;
      if (schemaGroup.binds) {
        schemaGroup.binds.forEach(async (bind) => {
          if (bind.mesh === void 0 || bind.index === void 0) {
            return;
          }
          const nodesUsingMesh = [];
          loader.gltf.nodes.forEach((node, i) => {
            if (node.mesh === bind.mesh) {
              nodesUsingMesh.push(i);
            }
          });
          const morphTargetIndex = bind.index;
          await Promise.all(nodesUsingMesh.map(async (nodeIndex) => {
            var _a2;
            const primitives = await gltfExtractPrimitivesFromNode(loader, nodeIndex);
            if (!primitives.every((primitive) => primitive.morphTargetManager && morphTargetIndex < primitive.morphTargetManager.numTargets)) {
              console.warn(`ExpressionImporter: ${schemaGroup.name} attempts to index ${morphTargetIndex}th morph but not found.`);
              return;
            }
            group.addBind({
              meshes: primitives,
              morphTargetIndex,
              weight: (_a2 = bind.weight) != null ? _a2 : 100
            });
          }));
        });
      }
      const materialValues = schemaGroup.materialValues;
      if (materialValues) {
        materialValues.forEach((materialValue) => {
          if (materialValue.materialName === void 0 || materialValue.propertyName === void 0 || materialValue.targetValue === void 0) {
            return;
          }
          const materials = [];
          materials.forEach((material) => {
            group.addMaterialValue({
              material,
              propertyName: renameMaterialProperty(materialValue.propertyName),
              targetValue: materialValue.targetValue
            });
          });
        });
      }
      expression.registeExpressionGroup(name, presetName, group);
    }));
    return expression;
  }
}
const VECTOR3_FRONT$1 = Object.freeze(new BABYLON.Vector3(0, 0, -1));
const _quat$1 = new BABYLON.Quaternion();
class RendererFirstPersonFlags {
  static _parseFirstPersonFlag(firstPersonFlag) {
    switch (firstPersonFlag) {
      case "Both":
        return 1;
      case "ThirdPersonOnly":
        return 2;
      case "FirstPersonOnly":
        return 3;
      default:
        return 0;
    }
  }
  constructor(firstPersonFlag, primitives) {
    this.firstPersonFlag = RendererFirstPersonFlags._parseFirstPersonFlag(firstPersonFlag);
    this.primitives = primitives;
    console.log("primitives:%O", primitives);
  }
}
const _FirstPerson = class {
  constructor(firstPersonBone, firstPersonBoneOffset, meshAnnotations) {
    this._meshAnnotations = [];
    this._firstPersonOnlyLayer = _FirstPerson._DEFAULT_FIRSTPERSON_ONLY_LAYER;
    this._thirdPersonOnlyLayer = _FirstPerson._DEFAULT_THIRDPERSON_ONLY_LAYER;
    this._bothLayer = _FirstPerson._DEFAULT_BOTH_LAYER;
    this._initialized = false;
    this._firstPersonBone = firstPersonBone;
    this._firstPersonBoneOffset = firstPersonBoneOffset;
    this._meshAnnotations = meshAnnotations;
  }
  get firstPersonBone() {
    return this._firstPersonBone;
  }
  get meshAnnotations() {
    return this._meshAnnotations;
  }
  getFirstPersonWorldDirection(target) {
    this._firstPersonBone.getWorldMatrix().decompose(...[,], _quat$1);
    target.copyFrom(VECTOR3_FRONT$1);
    multiplyQuaternionByVectorToRef(_quat$1, target, target);
    return target;
  }
  get firstPersonOnlyLayer() {
    return this._firstPersonOnlyLayer;
  }
  get thirdPersonOnlyLayer() {
    return this._thirdPersonOnlyLayer;
  }
  get bothLayer() {
    return this._bothLayer;
  }
  getFirstPersonBoneOffset(target) {
    return target.copyFrom(this._firstPersonBoneOffset);
  }
  getFirstPersonWorldPosition(v3) {
    const offset = this._firstPersonBoneOffset;
    const v = new BABYLON.Vector3(offset.x, offset.y, offset.z);
    v.copyFrom(BABYLON.Vector3.TransformCoordinates(v, this._firstPersonBone.getWorldMatrix()));
    return v3.set(v.x, v.y, v.z);
  }
  setup({ firstPersonOnlyLayer = _FirstPerson._DEFAULT_FIRSTPERSON_ONLY_LAYER, thirdPersonOnlyLayer = _FirstPerson._DEFAULT_THIRDPERSON_ONLY_LAYER } = {}) {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    this._firstPersonOnlyLayer = firstPersonOnlyLayer;
    this._thirdPersonOnlyLayer = thirdPersonOnlyLayer;
    this._meshAnnotations.forEach((item) => {
      if (item.firstPersonFlag === 3) {
        item.primitives.forEach((primitive) => {
          primitive.layerMask = this._firstPersonOnlyLayer;
        });
      } else if (item.firstPersonFlag === 2) {
        item.primitives.forEach((primitive) => {
          primitive.layerMask = this._firstPersonOnlyLayer;
        });
      } else if (item.firstPersonFlag === 0) {
        this._createHeadlessModel(item.primitives);
      }
    });
  }
  _createHeadlessModel(primitives) {
    primitives.forEach((primitive) => {
      if (primitive._isMesh) {
        const skinnedMesh = primitive;
        this._createHeadlessModelForSkinnedMesh(skinnedMesh.parent, skinnedMesh);
      } else {
        if (this._isEraseTarget(primitive)) {
          primitive.layerMask = this._thirdPersonOnlyLayer;
        }
      }
    });
  }
  _createHeadlessModelForSkinnedMesh(parent, mesh) {
    var _a;
    const bonesSet = /* @__PURE__ */ new Set();
    (_a = mesh.skeleton) == null ? void 0 : _a.bones.forEach((bone) => {
      if (bone.id === this._firstPersonBone.id) {
        this._addTargetFlag(bone, bonesSet);
      }
    });
    console.log(bonesSet);
    if (!Array.from(bonesSet).length) {
      mesh.layerMask = this._bothLayer;
      return;
    }
    mesh.layerMask = this._thirdPersonOnlyLayer;
  }
  _createErasedMesh(src, erasingBonesIndex) {
    const dst = new BABYLON.Mesh(`${src.name}(erase)`, ...[, ,], src.clone());
    dst.material = src.material;
    dst.name = `${src.name}(erase)`;
    dst.layerMask = this._firstPersonOnlyLayer;
    const geometry = dst.geometry;
    const skinIndexAttr = geometry.getVerticesData("matricesIndices");
    const skinIndex = [];
    for (let i = 0; i < skinIndexAttr.length; i += 4) {
      skinIndex.push([skinIndexAttr[i], skinIndexAttr[i + 1], skinIndexAttr[i + 2], skinIndexAttr[i + 3]]);
    }
    const skinWeightAttr = geometry.getVerticesData("matricesWeights");
    const skinWeight = [];
    for (let i = 0; i < skinWeightAttr.length; i += 4) {
      skinWeight.push([skinWeightAttr[i], skinWeightAttr[i + 1], skinWeightAttr[i + 2], skinWeightAttr[i + 3]]);
    }
    const indices = geometry.getIndices();
    if (!(indices == null ? void 0 : indices.length)) {
      throw new Error("The geometry doesn't have an index buffer");
    }
    const oldTriangles = Array.from(indices);
    const count = this._excludeTriangles(oldTriangles, skinWeight, skinIndex, erasingBonesIndex);
    const newTriangle = [];
    for (let i = 0; i < count; i++) {
      newTriangle[i] = oldTriangles[i];
    }
    geometry.setIndices(newTriangle);
    if (src.onBeforeBindObservable)
      ;
    return dst;
  }
  _excludeTriangles(triangles, bws, skinIndex, exclude) {
    let count = 0;
    if (bws != null && bws.length > 0) {
      for (let i = 0; i < triangles.length; i += 3) {
        const a = triangles[i];
        const b = triangles[i + 1];
        const c = triangles[i + 2];
        const bw0 = bws[a];
        const skin0 = skinIndex[a];
        if (bw0[0] > 0 && exclude.includes(skin0[0]))
          continue;
        if (bw0[1] > 0 && exclude.includes(skin0[1]))
          continue;
        if (bw0[2] > 0 && exclude.includes(skin0[2]))
          continue;
        if (bw0[3] > 0 && exclude.includes(skin0[3]))
          continue;
        const bw1 = bws[b];
        const skin1 = skinIndex[b];
        if (bw1[0] > 0 && exclude.includes(skin1[0]))
          continue;
        if (bw1[1] > 0 && exclude.includes(skin1[1]))
          continue;
        if (bw1[2] > 0 && exclude.includes(skin1[2]))
          continue;
        if (bw1[3] > 0 && exclude.includes(skin1[3]))
          continue;
        const bw2 = bws[c];
        const skin2 = skinIndex[c];
        if (bw2[0] > 0 && exclude.includes(skin2[0]))
          continue;
        if (bw2[1] > 0 && exclude.includes(skin2[1]))
          continue;
        if (bw2[2] > 0 && exclude.includes(skin2[2]))
          continue;
        if (bw2[3] > 0 && exclude.includes(skin2[3]))
          continue;
        triangles[count++] = a;
        triangles[count++] = b;
        triangles[count++] = c;
      }
    }
    return count;
  }
  _isEraseTarget(bone) {
    if (bone === this._firstPersonBone) {
      return true;
    } else if (!bone.parent) {
      return false;
    } else {
      return this._isEraseTarget(bone.parent);
    }
  }
  _addTargetFlag(bone, set) {
    if (!set.has(bone.id)) {
      set.add(bone.id);
      for (let i = 0; i < bone.children.length; i++) {
        this._addTargetFlag(bone.children[i], set);
      }
    }
  }
};
let FirstPerson = _FirstPerson;
FirstPerson._DEFAULT_BOTH_LAYER = 268435455;
FirstPerson._DEFAULT_FIRSTPERSON_ONLY_LAYER = 268435456;
FirstPerson._DEFAULT_THIRDPERSON_ONLY_LAYER = 536870912;
class FirstPersonImporter {
  async import(loader, humanoid) {
    var _a;
    const vrmExt = (_a = loader.gltf.extensions) == null ? void 0 : _a.VRM;
    if (!vrmExt) {
      return null;
    }
    const schemaFirstPerson = vrmExt.firstPerson;
    if (!schemaFirstPerson) {
      return null;
    }
    const firstPersonBoneIndex = schemaFirstPerson.firstPersonBone;
    let firstPersonBone;
    if (firstPersonBoneIndex === void 0 || firstPersonBoneIndex === -1) {
      firstPersonBone = humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head);
    } else {
      firstPersonBone = loader.gltf.nodes[firstPersonBoneIndex]._babylonTransformNode;
      const testMap = await gltfExtractPrimitivesFromNode(loader, firstPersonBoneIndex);
      console.log(testMap);
    }
    if (!firstPersonBone) {
      console.warn("FirstPersonImporter: Could not find firstPersonBone of the VRM");
      return null;
    }
    const firstPersonBoneOffset = schemaFirstPerson.firstPersonBoneOffset ? new BABYLON.Vector3(schemaFirstPerson.firstPersonBoneOffset.x, schemaFirstPerson.firstPersonBoneOffset.y, schemaFirstPerson.firstPersonBoneOffset.z) : new BABYLON.Vector3(0, 0.06, 0);
    const meshAnnotations = [];
    const nodePrimitivesMap = await gltfExtractPrimitivesFromNodes(loader);
    Array.from(nodePrimitivesMap.entries()).forEach(([nodeIndex, primitives]) => {
      const schemaNode = loader.gltf.nodes[nodeIndex];
      const flag = schemaFirstPerson.meshAnnotations ? schemaFirstPerson.meshAnnotations.find((a) => a.mesh === schemaNode.mesh) : void 0;
      meshAnnotations.push(new RendererFirstPersonFlags(flag == null ? void 0 : flag.firstPersonFlag, primitives));
    });
    return new FirstPerson(firstPersonBone, firstPersonBoneOffset, meshAnnotations);
  }
}
class HumanBone {
  constructor(node, humanLimit) {
    this.node = node;
    this.humanLimit = humanLimit;
  }
}
const _v3A$3 = new BABYLON.Vector3();
let _quatA$1 = new BABYLON.Quaternion();
class Humanoid {
  constructor(boneArray, humanDescription) {
    this.restPose = {};
    this.humanBones = this._createHumanBones(boneArray);
    this.humanDescription = humanDescription;
    this.restPose = this.getPose();
  }
  getPose() {
    const pose = {};
    Object.keys(this.humanBones).forEach((vrmBoneName) => {
      const node = this.getBoneNode(vrmBoneName);
      if (!node) {
        return;
      }
      if (pose[vrmBoneName]) {
        return;
      }
      _v3A$3.set(0, 0, 0);
      _quatA$1 = BABYLON.Quaternion.Identity();
      const restState = this.restPose[vrmBoneName];
      if (restState == null ? void 0 : restState.position) {
        _v3A$3.fromArray(restState.position).negate();
      }
      if (restState == null ? void 0 : restState.rotation) {
        _quatA$1 = BABYLON.Quaternion.FromArray(restState.rotation);
        BABYLON.Quaternion.InverseToRef(_quatA$1, _quatA$1);
      }
      _v3A$3.add(node.position);
      _quatA$1 = node.rotationQuaternion.multiply(_quatA$1);
      pose[vrmBoneName] = {
        position: _v3A$3.asArray(),
        rotation: _quatA$1.asArray()
      };
    }, {});
    return pose;
  }
  setPose(poseObject) {
    Object.keys(poseObject).forEach((boneName) => {
      const state = poseObject[boneName];
      const node = this.getBoneNode(boneName);
      if (!node) {
        return;
      }
      const restState = this.restPose[boneName];
      if (!restState) {
        return;
      }
      if (state.position) {
        node.position.fromArray(state.position);
        if (restState.position) {
          node.position.add(_v3A$3.fromArray(restState.position));
        }
      }
      if (state.rotation) {
        node.rotationQuaternion = BABYLON.Quaternion.FromArray(state.rotation);
        if (restState.rotation) {
          _quatA$1 = BABYLON.Quaternion.FromArray(restState.rotation);
          node.rotationQuaternion.multiply(_quatA$1);
        }
      }
    });
  }
  resetPose() {
    Object.entries(this.restPose).forEach(([boneName, rest]) => {
      const node = this.getBoneNode(boneName);
      if (!node) {
        return;
      }
      if (rest == null ? void 0 : rest.position) {
        node.position.fromArray(rest.position);
      }
      if (rest == null ? void 0 : rest.rotation) {
        node.rotationQuaternion = BABYLON.Quaternion.FromArray(rest.rotation);
      }
    });
  }
  getBone(name) {
    var _a;
    return (_a = this.humanBones[name][0]) != null ? _a : void 0;
  }
  getBones(name) {
    var _a;
    return (_a = this.humanBones[name]) != null ? _a : [];
  }
  getBoneNode(name) {
    var _a, _b;
    return (_b = (_a = this.humanBones[name][0]) == null ? void 0 : _a.node) != null ? _b : null;
  }
  getBoneNodes(name) {
    var _a, _b;
    return (_b = (_a = this.humanBones[name]) == null ? void 0 : _a.map((bone) => bone.node)) != null ? _b : [];
  }
  _createHumanBones(boneArray) {
    const bones = Object.values(VRMSchema.HumanoidBoneName).reduce((accum, name) => {
      accum[name] = [];
      return accum;
    }, {});
    boneArray.forEach((bone) => {
      bones[bone.name].push(bone.bone);
    });
    return bones;
  }
}
class HumanoidImporter {
  async import(loader) {
    var _a;
    const vrmExt = (_a = loader.gltf.extensions) == null ? void 0 : _a.VRM;
    if (!vrmExt) {
      return null;
    }
    const schemaHumanoid = vrmExt.humanoid;
    if (!schemaHumanoid) {
      return null;
    }
    const humanBoneArray = [];
    if (schemaHumanoid.humanBones) {
      await Promise.all(schemaHumanoid.humanBones.map(async (bone) => {
        if (!bone.bone || bone.node == null) {
          return;
        }
        const node = loader.babylonScene.transformNodes[bone.node];
        humanBoneArray.push({
          name: bone.bone,
          bone: new HumanBone(node, {
            axisLength: bone.axisLength,
            center: bone.center && new BABYLON.Vector3(bone.center.x, bone.center.y, bone.center.z),
            max: bone.max && new BABYLON.Vector3(bone.max.x, bone.max.y, bone.max.z),
            min: bone.min && new BABYLON.Vector3(bone.min.x, bone.min.y, bone.min.z),
            useDefaultValues: bone.useDefaultValues
          })
        });
      }));
    }
    const humanDescription = {
      armStretch: schemaHumanoid.armStretch,
      legStretch: schemaHumanoid.legStretch,
      upperArmTwist: schemaHumanoid.upperArmTwist,
      lowerArmTwist: schemaHumanoid.lowerArmTwist,
      upperLegTwist: schemaHumanoid.upperLegTwist,
      lowerLegTwist: schemaHumanoid.lowerLegTwist,
      feetSpacing: schemaHumanoid.feetSpacing,
      hasTranslationDoF: schemaHumanoid.hasTranslationDoF
    };
    return new Humanoid(humanBoneArray, humanDescription);
  }
}
const hermiteSpline = (y0, y1, t0, t1, x) => {
  const xc = x * x * x;
  const xs = x * x;
  const dy = y1 - y0;
  const h01 = -2 * xc + 3 * xs;
  const h10 = xc - 2 * xs + x;
  const h11 = xc - xs;
  return y0 + dy * h01 + t0 * h10 + t1 * h11;
};
const evaluateCurve = (arr, x) => {
  if (arr.length < 8) {
    throw new Error("evaluateCurve: Invalid curve detected! (Array length must be 8 at least)");
  }
  if (arr.length % 4 !== 0) {
    throw new Error("evaluateCurve: Invalid curve detected! (Array length must be multiples of 4");
  }
  let outNode;
  for (outNode = 0; ; outNode++) {
    if (arr.length <= 4 * outNode) {
      return arr[4 * outNode - 3];
    } else if (x <= arr[4 * outNode]) {
      break;
    }
  }
  const inNode = outNode - 1;
  if (inNode < 0) {
    return arr[4 * inNode + 5];
  }
  const x0 = arr[4 * inNode];
  const x1 = arr[4 * outNode];
  const xHermite = (x - x0) / (x1 - x0);
  const y0 = arr[4 * inNode + 1];
  const y1 = arr[4 * outNode + 1];
  const t0 = arr[4 * inNode + 3];
  const t1 = arr[4 * outNode + 2];
  return hermiteSpline(y0, y1, t0, t1, xHermite);
};
class CurveMapper {
  constructor(xRange, yRange, curve) {
    this.curve = [0, 0, 0, 1, 1, 1, 1, 0];
    this.curveXRangeDegree = 90;
    this.curveYRangeDegree = 10;
    if (xRange !== void 0) {
      this.curveXRangeDegree = xRange;
    }
    if (yRange !== void 0) {
      this.curveYRangeDegree = yRange;
    }
    if (curve !== void 0) {
      this.curve = curve;
    }
  }
  map(src) {
    const clampedSrc = Math.min(Math.max(src, 0), this.curveXRangeDegree);
    const x = clampedSrc / this.curveXRangeDegree;
    return this.curveYRangeDegree * evaluateCurve(this.curve, x);
  }
}
class LookAtApplyer {
}
class LookAtExpressionApplyer extends LookAtApplyer {
  constructor(expressionProxy, curveHorizontal, curveVerticalDown, curveVerticalUp) {
    super();
    this.type = VRMSchema.FirstPersonLookAtTypeName.Expression;
    this._curveHorizontal = curveHorizontal;
    this._curveVerticalDown = curveVerticalDown;
    this._curveVerticalUp = curveVerticalUp;
    this._expressionProxy = expressionProxy;
  }
  name() {
    return VRMSchema.FirstPersonLookAtTypeName.Expression;
  }
  lookAt(euler) {
    const srcX = euler.x;
    const srcY = euler.y;
    if (srcX < 0) {
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookup, 0);
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookdown, this._curveVerticalDown.map(-srcX));
    } else {
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookdown, 0);
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookup, this._curveVerticalUp.map(srcX));
    }
    if (srcY < 0) {
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookleft, 0);
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookright, this._curveHorizontal.map(-srcY));
    } else {
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookright, 0);
      this._expressionProxy.setValue(VRMSchema.ExpressionPresetName.Lookleft, this._curveHorizontal.map(srcY));
    }
  }
}
const _euler = new BABYLON.Vector3(0, 0, 0);
class LookAtBoneApplyer extends LookAtApplyer {
  constructor(humanoid, curveHorizontalInner, curveHorizontalOuter, curveVerticalDown, curveVerticalUp) {
    super();
    this.type = VRMSchema.FirstPersonLookAtTypeName.Bone;
    this._curveHorizontalInner = curveHorizontalInner;
    this._curveHorizontalOuter = curveHorizontalOuter;
    this._curveVerticalDown = curveVerticalDown;
    this._curveVerticalUp = curveVerticalUp;
    this._leftEye = humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftEye);
    this._rightEye = humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightEye);
  }
  lookAt(euler) {
    const srcX = euler.x;
    const srcY = euler.y;
    if (this._leftEye) {
      if (srcX < 0) {
        _euler.x = -this._curveVerticalDown.map(-srcX);
      } else {
        _euler.x = this._curveVerticalUp.map(srcX);
      }
      if (srcY < 0) {
        _euler.y = -this._curveHorizontalInner.map(-srcY);
      } else {
        _euler.y = this._curveHorizontalOuter.map(srcY);
      }
      this._leftEye.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(_euler.x, _euler.y, _euler.z);
    }
    if (this._rightEye) {
      if (srcX < 0) {
        _euler.x = -this._curveVerticalDown.map(-srcX);
      } else {
        _euler.x = this._curveVerticalUp.map(srcX);
      }
      if (srcY < 0) {
        _euler.y = -this._curveHorizontalOuter.map(-srcY);
      } else {
        _euler.y = this._curveHorizontalInner.map(srcY);
      }
      this._rightEye.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(_euler.x, _euler.y, _euler.z);
    }
  }
}
const VECTOR3_FRONT = Object.freeze(new BABYLON.Vector3(0, 0, -1));
const _v3A$2 = new BABYLON.Vector3();
const _v3B$1 = new BABYLON.Vector3();
const _v3C$1 = new BABYLON.Vector3();
const _quat = new BABYLON.Quaternion();
class LookAtHead {
  constructor(firstPerson, applyer) {
    this.autoUpdate = true;
    this._euler = new BABYLON.Vector3(0, 0, 0);
    this.firstPerson = firstPerson;
    this.applyer = applyer;
  }
  getLookAtWorldDirection(target) {
    this.firstPerson.firstPersonBone.getWorldMatrix().decompose(...[,], _quat);
    const quaternionElur = BABYLON.Quaternion.FromEulerVector(this._euler);
    multiplyQuaternionByVectorToRef(quaternionElur, target.copyFrom(VECTOR3_FRONT), target);
    multiplyQuaternionByVectorToRef(_quat, target, target);
    return target;
  }
  lookAt(position) {
    this._calcEuler(this._euler, position);
    if (this.applyer) {
      this.applyer.lookAt(this._euler);
    }
  }
  update(delta) {
    if (delta <= 0) {
      return;
    }
    if (this.target && this.autoUpdate) {
      _v3A$2.copyFrom(this.target.getAbsolutePosition());
      this.lookAt(_v3A$2);
      if (this.applyer) {
        this.applyer.lookAt(this._euler);
      }
    }
  }
  _calcEuler(target, position) {
    const headPosition = this.firstPerson.getFirstPersonWorldPosition(_v3B$1);
    const lookAtDir = _v3C$1.copyFrom(position).subtract(headPosition).normalize();
    this.firstPerson.firstPersonBone.getWorldMatrix().decompose(...[,], _quat);
    BABYLON.Quaternion.InverseToRef(_quat, _quat);
    multiplyQuaternionByVectorToRef(_quat, lookAtDir, lookAtDir);
    target.x = Math.atan2(lookAtDir.y, Math.sqrt(lookAtDir.x * lookAtDir.x + lookAtDir.z * lookAtDir.z));
    target.y = Math.atan2(-lookAtDir.x, -lookAtDir.z);
    return target;
  }
}
LookAtHead.EULER_ORDER = "YXZ";
const DEG2RAD = Math.PI / 180;
class LookAtImporter {
  import(loader, firstPerson, expressionProxy, humanoid) {
    var _a;
    const vrmExt = (_a = loader.gltf.extensions) == null ? void 0 : _a.VRM;
    if (!vrmExt) {
      return null;
    }
    const schemaFirstPerson = vrmExt.firstPerson;
    if (!schemaFirstPerson) {
      return null;
    }
    const applyer = this._importApplyer(schemaFirstPerson, expressionProxy, humanoid);
    return new LookAtHead(firstPerson, applyer || void 0);
  }
  _importApplyer(schemaFirstPerson, expressionProxy, humanoid) {
    const lookAtHorizontalInner = schemaFirstPerson.lookAtHorizontalInner;
    const lookAtHorizontalOuter = schemaFirstPerson.lookAtHorizontalOuter;
    const lookAtVerticalDown = schemaFirstPerson.lookAtVerticalDown;
    const lookAtVerticalUp = schemaFirstPerson.lookAtVerticalUp;
    switch (schemaFirstPerson.lookAtTypeName) {
      case VRMSchema.FirstPersonLookAtTypeName.Bone: {
        if (lookAtHorizontalInner === void 0 || lookAtHorizontalOuter === void 0 || lookAtVerticalDown === void 0 || lookAtVerticalUp === void 0) {
          return null;
        } else {
          return new LookAtBoneApplyer(humanoid, this._importCurveMapperBone(lookAtHorizontalInner), this._importCurveMapperBone(lookAtHorizontalOuter), this._importCurveMapperBone(lookAtVerticalDown), this._importCurveMapperBone(lookAtVerticalUp));
        }
      }
      case VRMSchema.FirstPersonLookAtTypeName.Expression: {
        if (lookAtHorizontalOuter === void 0 || lookAtVerticalDown === void 0 || lookAtVerticalUp === void 0) {
          return null;
        } else {
          return new LookAtExpressionApplyer(expressionProxy, this._importCurveMapperExpression(lookAtHorizontalOuter), this._importCurveMapperExpression(lookAtVerticalDown), this._importCurveMapperExpression(lookAtVerticalUp));
        }
      }
      default: {
        return null;
      }
    }
  }
  _importCurveMapperBone(map) {
    return new CurveMapper(typeof map.xRange === "number" ? DEG2RAD * map.xRange : void 0, typeof map.yRange === "number" ? DEG2RAD * map.yRange : void 0, map.curve);
  }
  _importCurveMapperExpression(map) {
    return new CurveMapper(typeof map.xRange === "number" ? DEG2RAD * map.xRange : void 0, map.yRange, map.curve);
  }
}
class MetaImporter {
  constructor(options) {
    var _a;
    this.ignoreTexture = (_a = options == null ? void 0 : options.ignoreTexture) != null ? _a : false;
  }
  async import(loader) {
    var _a;
    const vrmExt = (_a = loader.gltf.extensions) == null ? void 0 : _a.VRM;
    if (!vrmExt) {
      return null;
    }
    const schemaMeta = vrmExt.meta;
    if (!schemaMeta) {
      return null;
    }
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
      violentUssageName: schemaMeta.violentUssageName
    };
  }
}
class SpringBoneManager {
  constructor(colliderGroups, springBoneGroupList) {
    this.colliderGroups = [];
    this.springBoneGroupList = [];
    this.colliderGroups = colliderGroups;
    this.springBoneGroupList = springBoneGroupList;
  }
  setCenter(root) {
    this.springBoneGroupList.forEach((springBoneGroup) => {
      springBoneGroup.forEach((springBone) => {
        springBone.center = root;
      });
    });
  }
  lateUpdate(delta) {
    this.springBoneGroupList.forEach((springBoneGroup) => {
      springBoneGroup.forEach((springBone) => {
        springBone.update(delta);
      });
    });
  }
  reset() {
    this.springBoneGroupList.forEach((springBoneGroup) => {
      springBoneGroup.forEach((springBone) => {
        springBone.reset();
      });
    });
  }
}
const IDENTITY_QUATERNION = Object.freeze(new BABYLON.Quaternion());
const _v3A$1 = new BABYLON.Vector3();
const _v3B = new BABYLON.Vector3();
const _v3C = new BABYLON.Vector3();
const _quatA = new BABYLON.Quaternion();
const _matA = new BABYLON.Matrix();
const _matB = new BABYLON.Matrix();
class SpringBone {
  constructor(bone, params = {}) {
    var _a, _b, _c, _d, _e, _f;
    this._currentTail = new BABYLON.Vector3();
    this._prevTail = new BABYLON.Vector3();
    this._nextTail = new BABYLON.Vector3();
    this._boneAxis = new BABYLON.Vector3();
    this._centerSpacePosition = new BABYLON.Vector3();
    this._center = null;
    this._parentWorldRotation = new BABYLON.Quaternion();
    this._initialLocalMatrix = new BABYLON.Matrix();
    this._initialLocalRotation = new BABYLON.Quaternion();
    this._initialLocalChildPosition = new BABYLON.Vector3();
    this.bone = bone;
    this.radius = (_a = params.radius) != null ? _a : 0.02;
    this.stiffnessForce = (_b = params.stiffnessForce) != null ? _b : 1;
    this.gravityDir = params.gravityDir ? new BABYLON.Vector3().copyFrom(params.gravityDir) : new BABYLON.Vector3().set(0, -1, 0);
    this.gravityPower = (_c = params.gravityPower) != null ? _c : 0;
    this.dragForce = (_d = params.dragForce) != null ? _d : 0.4;
    this.colliders = (_e = params.colliders) != null ? _e : [];
    const boneWorldMatrix = this.bone.getWorldMatrix();
    boneWorldMatrix.getTranslationToRef(this._centerSpacePosition);
    this._initialLocalMatrix.copyFrom(this.bone._localMatrix);
    this._initialLocalRotation.copyFrom(this.bone.rotationQuaternion);
    if (this.bone.getChildren().length === 0) {
      this._initialLocalChildPosition.copyFrom(this.bone.position).normalize().scaleToRef(0.07, this._initialLocalChildPosition);
    } else {
      const firstChild = this.bone.getChildTransformNodes()[0];
      this._initialLocalChildPosition.copyFrom(firstChild.position);
    }
    BABYLON.Vector3.TransformCoordinatesToRef(this._initialLocalChildPosition, this.bone.getWorldMatrix(), this._currentTail);
    this._prevTail.copyFrom(this._currentTail);
    this._nextTail.copyFrom(this._currentTail);
    this._boneAxis.copyFrom(this._initialLocalChildPosition).normalize();
    this._centerSpaceBoneLength = BABYLON.Vector3.TransformCoordinates(this._initialLocalChildPosition, this.bone.getWorldMatrix()).subtract(this._centerSpacePosition).length();
    this.center = (_f = params.center) != null ? _f : null;
  }
  get center() {
    return this._center;
  }
  set center(center) {
    this._getMatrixCenterToWorld(_matA);
    BABYLON.Vector3.TransformCoordinatesToRef(this._currentTail, _matA, this._currentTail);
    BABYLON.Vector3.TransformCoordinatesToRef(this._prevTail, _matA, this._prevTail);
    BABYLON.Vector3.TransformCoordinatesToRef(this._nextTail, _matA, this._nextTail);
    this._center = center;
    this._getMatrixWorldToCenter(_matA);
    BABYLON.Vector3.TransformCoordinatesToRef(this._currentTail, _matA, this._currentTail);
    BABYLON.Vector3.TransformCoordinatesToRef(this._prevTail, _matA, this._prevTail);
    BABYLON.Vector3.TransformCoordinatesToRef(this._nextTail, _matA, this._nextTail);
    this.bone.getWorldMatrix().multiplyToRef(_matA, _matA);
    _matA.getTranslationToRef(this._centerSpacePosition);
    this._centerSpaceBoneLength = BABYLON.Vector3.TransformCoordinates(this._initialLocalChildPosition, _matA).subtract(this._centerSpacePosition).length();
  }
  reset() {
    var _a, _b;
    (_b = (_a = this.bone) == null ? void 0 : _a.rotationQuaternion) == null ? void 0 : _b.copyFrom(this._initialLocalRotation);
    Matrix.ComposeToRef(this.bone.scaling, this.bone.rotationQuaternion, this.bone.position, this.bone._localMatrix);
    this.bone.freezeWorldMatrix(this.bone._localMatrix.multiply(this._getParentMatrixWorld()));
    this.bone.getWorldMatrix().getTranslationToRef(this._centerSpacePosition);
    BABYLON.Vector3.TransformCoordinatesToRef(this._initialLocalChildPosition, this.bone.getWorldMatrix(), this._currentTail);
    this._prevTail.copyFrom(this._currentTail);
    this._nextTail.copyFrom(this._currentTail);
  }
  update(delta) {
    if (delta <= 0) {
      return;
    }
    this.bone.freezeWorldMatrix(this.bone._localMatrix.multiply(this._getParentMatrixWorld()));
    if (this.bone.parent) {
      this.bone.parent.getWorldMatrix().decompose(void 0, this._parentWorldRotation);
    } else {
      this._parentWorldRotation.copyFrom(IDENTITY_QUATERNION);
    }
    this._getMatrixWorldToCenter(_matA);
    this.bone.getWorldMatrix().multiplyToRef(_matA, _matA);
    _matA.getTranslationToRef(this._centerSpacePosition);
    this._getMatrixWorldToCenter(_matB);
    this._getParentMatrixWorld().multiplyToRef(_matB, _matB);
    const stiffness = this.stiffnessForce * delta;
    const external = _v3B.copyFrom(this.gravityDir).scaleToRef(this.gravityPower * delta, _v3B);
    const tempV3A = new BABYLON.Vector3();
    const tempV3B = new BABYLON.Vector3();
    BABYLON.Vector3.TransformCoordinatesToRef(BABYLON.Vector3.TransformCoordinates(this._boneAxis, this._initialLocalMatrix), _matB, tempV3A);
    tempV3A.subtractToRef(this._centerSpacePosition, tempV3A);
    tempV3A.normalize().scaleToRef(stiffness, tempV3A);
    tempV3B.copyFrom(this._currentTail).subtractToRef(this._prevTail, tempV3B);
    tempV3B.scaleToRef(1 - this.dragForce, tempV3B);
    this._nextTail.copyFrom(this._currentTail).addToRef(tempV3B, this._nextTail);
    this._nextTail.addToRef(tempV3A, this._nextTail);
    this._nextTail.addToRef(external, this._nextTail);
    this._nextTail.subtractToRef(this._centerSpacePosition, this._nextTail);
    this._nextTail.normalize();
    this._nextTail.scaleToRef(this._centerSpaceBoneLength, this._nextTail);
    this._nextTail.addToRef(this._centerSpacePosition, this._nextTail);
    this._collision(this._nextTail);
    this._prevTail.copyFrom(this._currentTail);
    this._currentTail.copyFrom(this._nextTail);
    const initialCenterSpaceMatrixInv = new BABYLON.Matrix();
    _matA.copyFrom(this._initialLocalMatrix.multiply(_matB));
    _matA.invertToRef(initialCenterSpaceMatrixInv);
    fromUnitVectorsToRef(this._boneAxis, BABYLON.Vector3.TransformCoordinates(_v3A$1.copyFrom(this._nextTail), initialCenterSpaceMatrixInv).normalize(), _quatA);
    _quatA.multiplyToRef(this._initialLocalRotation, this.bone.rotationQuaternion);
    Matrix.ComposeToRef(this.bone.scaling, this.bone.rotationQuaternion, this.bone.position, this.bone._localMatrix);
    this.bone.freezeWorldMatrix(this.bone._localMatrix.multiply(this._getParentMatrixWorld()));
  }
  _collision(tail) {
    this.colliders.forEach((collider) => {
      this._getMatrixWorldToCenter(_matA);
      _matA.multiplyToRef(collider.getWorldMatrix(), _matA);
      _matA.getTranslationToRef(_v3A$1);
      const colliderCenterSpacePosition = _v3A$1;
      const colliderRadius = collider.getBoundingInfo().boundingSphere.radius;
      const r = this.radius + colliderRadius;
      if (BABYLON.Vector3.DistanceSquared(tail, colliderCenterSpacePosition) <= r * r) {
        tail.subtractToRef(colliderCenterSpacePosition, _v3B);
        const normal = _v3B.normalize();
        normal.scaleToRef(r, normal);
        colliderCenterSpacePosition.addToRef(normal, _v3C);
        const posFromCollider = _v3C;
        posFromCollider.subtractToRef(this._centerSpacePosition, posFromCollider);
        posFromCollider.normalize();
        posFromCollider.scaleToRef(this._centerSpaceBoneLength, posFromCollider);
        posFromCollider.addToRef(this._centerSpacePosition, posFromCollider);
        tail.copyFrom(posFromCollider);
      }
    });
  }
  _getMatrixCenterToWorld(target) {
    if (this._center) {
      target.copyFrom(this._center.getWorldMatrix());
    } else {
      target.copyFrom(BABYLON.Matrix.Identity());
    }
    return target;
  }
  _getMatrixWorldToCenter(target) {
    if (this._center) {
      this._center.getWorldMatrix().invertToRef(target);
    } else {
      target.copyFrom(BABYLON.Matrix.Identity());
    }
    return target;
  }
  _getParentMatrixWorld() {
    return this.bone.parent ? this.bone.parent.getWorldMatrix() : BABYLON.Matrix.Identity();
  }
}
const _v3A = new BABYLON.Vector3();
class SpringBoneImporter {
  async import(loader) {
    var _a;
    const vrmExt = (_a = loader.gltf.extensions) == null ? void 0 : _a.VRM;
    if (!vrmExt)
      return null;
    const schemaSecondaryAnimation = vrmExt.secondaryAnimation;
    if (!schemaSecondaryAnimation)
      return null;
    const colliderGroups = await this._importColliderMeshGroups(loader, schemaSecondaryAnimation);
    const springBoneGroupList = await this._importSpringBoneGroupList(loader, schemaSecondaryAnimation, colliderGroups);
    return new SpringBoneManager(colliderGroups, springBoneGroupList);
  }
  _createSpringBone(bone, params = {}) {
    return new SpringBone(bone, params);
  }
  async _importSpringBoneGroupList(loader, schemaSecondaryAnimation, colliderGroups) {
    const springBoneGroups = schemaSecondaryAnimation.boneGroups || [];
    const springBoneGroupList = [];
    await Promise.all(springBoneGroups.map(async (vrmBoneGroup) => {
      if (vrmBoneGroup.stiffiness === void 0 || vrmBoneGroup.gravityDir === void 0 || vrmBoneGroup.gravityDir.x === void 0 || vrmBoneGroup.gravityDir.y === void 0 || vrmBoneGroup.gravityDir.z === void 0 || vrmBoneGroup.gravityPower === void 0 || vrmBoneGroup.dragForce === void 0 || vrmBoneGroup.hitRadius === void 0 || vrmBoneGroup.colliderGroups === void 0 || vrmBoneGroup.bones === void 0 || vrmBoneGroup.center === void 0) {
        return;
      }
      const stiffnessForce = vrmBoneGroup.stiffiness;
      const gravityDir = new BABYLON.Vector3(vrmBoneGroup.gravityDir.x, vrmBoneGroup.gravityDir.y, vrmBoneGroup.gravityDir.z);
      const gravityPower = vrmBoneGroup.gravityPower;
      const dragForce = vrmBoneGroup.dragForce;
      const radius = vrmBoneGroup.hitRadius;
      const colliders = [];
      vrmBoneGroup.colliderGroups.forEach((colliderIndex) => {
        colliders.push(...colliderGroups[colliderIndex].colliders);
      });
      const springBoneGroup = [];
      await Promise.all(vrmBoneGroup.bones.map(async (nodeIndex) => {
        const springRootBone = loader.babylonScene.transformNodes[nodeIndex];
        const center = vrmBoneGroup.center !== -1 ? loader.babylonScene.transformNodes[vrmBoneGroup.center] : null;
        if (!springRootBone) {
          return;
        }
        traverse(springRootBone, (bone) => {
          const springBone = this._createSpringBone(bone, {
            radius,
            stiffnessForce,
            gravityDir,
            gravityPower,
            dragForce,
            colliders,
            center
          });
          springBoneGroup.push(springBone);
        });
      }));
      springBoneGroupList.push(springBoneGroup);
    }));
    return springBoneGroupList;
  }
  async _importColliderMeshGroups(loader, schemaSecondaryAnimation) {
    const vrmColliderGroups = schemaSecondaryAnimation.colliderGroups;
    if (vrmColliderGroups === void 0)
      return [];
    const colliderGroups = [];
    vrmColliderGroups.forEach(async (colliderGroup) => {
      if (colliderGroup.node === void 0 || colliderGroup.colliders === void 0) {
        return;
      }
      const bone = loader.babylonScene.transformNodes[colliderGroup.node];
      const colliders = [];
      colliderGroup.colliders.forEach((collider) => {
        if (collider.offset === void 0 || collider.offset.x === void 0 || collider.offset.y === void 0 || collider.offset.z === void 0 || collider.radius === void 0) {
          return;
        }
        const offset = _v3A.set(collider.offset.x, collider.offset.y, collider.offset.z);
        const colliderMesh = this._createColliderMesh(collider.radius, offset, loader.babylonScene);
        colliderMesh.setParent(bone);
        colliders.push(colliderMesh);
      });
      const colliderMeshGroup = {
        node: colliderGroup.node,
        colliders
      };
      colliderGroups.push(colliderMeshGroup);
    });
    return colliderGroups;
  }
  _createColliderMesh(radius, offset, scene) {
    new BABYLON.Material("collider", scene);
    const colliderMesh = BABYLON.MeshBuilder.CreateSphere("collider", { segments: 32, diameter: 2 * radius });
    colliderMesh.visibility = 0;
    colliderMesh.position.copyFrom(offset);
    colliderMesh.name = "vrmColliderSphere";
    colliderMesh.getBoundingInfo().boundingSphere.scale(1 / 3);
    return colliderMesh;
  }
}
class Importer {
  constructor(options = {}) {
    this._metaImporter = options.metaImporter || new MetaImporter();
    this._expressionImporter = options.expressionImporter || new ExpressionImporter();
    this._lookAtImporter = options.lookAtImporter || new LookAtImporter();
    this._humanoidImporter = options.humanoidImporter || new HumanoidImporter();
    this._firstPersonImporter = options.firstPersonImporter || new FirstPersonImporter();
    this._springBoneImporter = options.springBoneImporter || new SpringBoneImporter();
  }
  async import(loader) {
    if (loader.gltf.extensions === void 0 || loader.gltf.extensions.VRM === void 0) {
      throw new Error("Could not find VRM extension on the GLTF");
    }
    const meta = await this._metaImporter.import(loader) || void 0;
    const humanoid = await this._humanoidImporter.import(loader) || void 0;
    const firstPerson = humanoid ? await this._firstPersonImporter.import(loader, humanoid) || void 0 : void 0;
    const expressionProxy = await this._expressionImporter.import(loader) || void 0;
    const lookAt = firstPerson && expressionProxy && humanoid ? await this._lookAtImporter.import(loader, firstPerson, expressionProxy, humanoid) || void 0 : void 0;
    const springBoneManager = await this._springBoneImporter.import(loader) || void 0;
    return new VRM({
      scene: loader.babylonScene,
      meta,
      humanoid,
      firstPerson,
      expressionProxy,
      lookAt,
      springBoneManager
    });
  }
}
class VRM {
  static async from(loader, options = {}) {
    const importer = new Importer(options);
    return await importer.import(loader);
  }
  constructor(params) {
    this.scene = params.scene;
    this.humanoid = params.humanoid;
    this.expressionProxy = params.expressionProxy;
    this.firstPerson = params.firstPerson;
    this.lookAt = params.lookAt;
    this.materials = params.materials;
    this.springBoneManager = params.springBoneManager;
    this.meta = params.meta;
  }
  update(delta) {
    if (this.lookAt) {
      this.lookAt.update(delta);
    }
    if (this.expressionProxy) {
      this.expressionProxy.update();
    }
    if (this.springBoneManager) {
      this.springBoneManager.lateUpdate(delta);
    }
    if (this.materials) {
      this.materials.forEach((material) => {
        if (material.updateVRMMaterials) {
          material.updateVRMMaterials(delta);
        }
      });
    }
  }
  dispose() {
    const scene = this.scene;
    if (scene) {
      scene.rootNodes.forEach((node) => deepDispose(node));
    }
  }
}
class VRMFileLoader extends GLTFFileLoader {
  constructor() {
    super(...arguments);
    this.name = "vrm";
    this.extensions = {
      ".vrm": { isBinary: true }
    };
  }
  createPlugin() {
    return new VRMFileLoader();
  }
}
const NAME = "VRM";
class VRMExtensionLoader {
  constructor(loader) {
    this.loader = loader;
    this.name = NAME;
    this.enabled = true;
    this.meshesFrom = 0;
    this.transformNodesFrom = 0;
    this.meshesFrom = this.loader.babylonScene.meshes.length - 1;
    this.transformNodesFrom = this.loader.babylonScene.transformNodes.length;
  }
  dispose() {
    this.loader = null;
  }
  onReady() {
    if (!this.loader.gltf.extensions || !this.loader.gltf.extensions[NAME]) {
      return;
    }
    const scene = this.loader.babylonScene;
    VRM.from(this.loader).then((vrm) => {
      scene.metadata = scene.metadata || {};
      scene.metadata.vrm = scene.metadata.vrm || [];
      scene.metadata.vrm.push(vrm);
      this.loader.babylonScene.onDisposeObservable.add(() => {
        vrm.dispose();
        this.loader.babylonScene.metadata.vrm = [];
      });
    });
  }
}
GLTFLoader.RegisterExtension(NAME, (loader) => {
  return new VRMExtensionLoader(loader);
});
if (BABYLON.SceneLoader) {
  BABYLON.SceneLoader.RegisterPlugin(new VRMFileLoader());
}
export { CurveMapper, ExpressionGroup, ExpressionImporter, ExpressionProxy, FirstPerson, FirstPersonImporter, HumanBone, Humanoid, HumanoidImporter, Importer, LookAtApplyer, LookAtBoneApplyer, LookAtExpressionApplyer, LookAtHead, LookAtImporter, RendererFirstPersonFlags, SpringBone, SpringBoneImporter, SpringBoneManager, VRM, VRMExtensionLoader, VRMFileLoader, VRMSchema };

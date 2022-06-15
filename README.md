# What's this?  

Loading VRM with BabylonJS in the web. 

TODO:  
- MToon Shader Integration  
- Confirm First Person  
- VMD Animation Ingeration  
- Demo  

## 1. ThreeJS(3JS) VS. BabylonJS (BJS)  
Origin project base on ThreeJS [three-vrm](https://github.com/pixiv/three-vrm)  

#### Class 
- Object3d VS. TransformNode
- Matrix4 VS. Matrix
- Color VS. Color3 or Color4

#### Method
// IMPORTANT：  
3JS [multiply](https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix4.js#L340): a.multiply(b) = b x a  
BJS [multiply](https://github.com/BabylonJS/Babylon.js/blob/master/src/Maths/math.vector.ts#L4687): a.multiply(b) = a x b  


## 2. Shader  

#### The process in BJS  

###### Without custom shader
- Scene Code is processed in the CPU by the BJS Engine Code to produce a Virtual 3D Model
- Virtual 3D Model is processed in the CPU by the BJS Engine Code to produce Shader GPU Code
- Shader GPU Code is processed by GPU to produce screen image.
###### With custom shader
- Scene Code is processed in the CPU by the BJS Engine Code to produce a Virtual 3D Model
- Virtual 3D Model and User Shader Code is processed in the CPU by the BJS Engine Code to produce the Shader GPU Code
- Shader GPU Code is processed by GPU to produce the screen image.


## 3.About VRM  
[What is VRM](https://vrm.dev/en/vrm/)
[The specification](https://github.com/vrm-c/vrm-specification/tree/master/specification)

#### Expression(BlendShape in Specifation 0.0)  
在Spec. Version0中名称是BlendShape
在Spec. Version1中名称是Expression
主要是面部表情控制，以及一些组合，组合可展现一系列情绪，如生气，开心等

#### FirstPerson
第一人称的展现方式，模型默认是第三人称展现方式。
第一人称的展现方式可以用于射击游戏或者VR。

#### Humanoid
类人模型的树状结构骨架，描述了身体各个部分连接情况

#### LookAt
这个分3个层面
- 眼球基于目标跟随
- 目标超出眼球可视范围而致使头部转动
- 目标超出头部转动范围而致使身体转动

#### Material
材质纹理，VRM里主要是使用MToon材质 

#### Meta  
元信息，比如模型的名字，作者，许可方式，基于VRM的规范版本等等  

#### SpringBone
柔性骨骼，有些地方也叫Secondary Animation.
主要是头发，衣服，胸部在重力或者风影响下的运动方式

## 4. glTF
[GLTF Spec.](https://github.com/KhronosGroup/glTF/tree/main/specification/2.0/schema)

## Vue 3 + Typescript + Vite

This template should help get you started developing with Vue 3 and Typescript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

#### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

#### Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can enable Volar's `.vue` type support plugin by running `Volar: Switch TS Plugin on/off` from VSCode command palette.

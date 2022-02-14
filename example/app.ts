import * as BABYLON from '@babylonjs/core'
import '../src/index'
class App {

  constructor() {
    // create the canvas html element and attach it to the webpage
    const canvas = document.querySelector<HTMLElement>('#model')
    canvas!.style.width = '100%'
    canvas!.style.height = '100%'

    const engine = new BABYLON.Engine(canvas as HTMLCanvasElement, true)
    const scene = new BABYLON.Scene(engine)
    scene.clearColor = new BABYLON.Color4(0.788, 0.965, 0.733, 1.0)

    const camera = new BABYLON.ArcRotateCamera('camera', -1.5, 1.5, 5, new BABYLON.Vector3(0, 1, 0), scene)
    camera.attachControl(canvas, true)

    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 1), scene)
    light.intensity = 1.5

    engine.runRenderLoop(() => {
      scene.render()
    })


    this.loadVRM(scene)
  }
  async loadVRM(scene) {
    const vrmScene = await BABYLON.SceneLoader.AppendAsync('/models/', 'boy.vrm', scene)
    vrmScene.onBeforeRenderObservable.addOnce((s)=>{
      const vrm = s.metadata.vrm[0]
      console.log(vrm)
      // vrm.firstPerson.setup()
    })
  }
}

const app = new App()

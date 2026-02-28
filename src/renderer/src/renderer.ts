import { createScene } from '../scene-utils/create-scene'
import { Engine } from '../classes/engine'
import { createCube } from '../scene-utils/create-cube'

const { ambientLight, directionalLight, filmWindow, characterWindow, scene, renderer } =
  createScene()
filmWindow.camera.position.z = 8
characterWindow.camera.position.z = 5

const cube = createCube()

characterWindow.moveWithGsap(400, 30, 0.5)

const engine = new Engine(
  scene,
  renderer,
  [filmWindow, characterWindow],
  [ambientLight, directionalLight],
  [cube]
)

engine.start()

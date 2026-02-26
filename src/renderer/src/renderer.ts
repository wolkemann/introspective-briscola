import { createScene } from '../scene-utils/create-scene'
import { Engine } from '../classes/engine'
import { createCube } from '../scene-utils/create-cube'

const { filmWindow, characterWindow, scene, renderer } = createScene()
filmWindow.camera.position.z = 8
characterWindow.camera.position.z = 5

const cube = createCube()

const engine = new Engine(scene, renderer, [filmWindow, characterWindow], [cube])

engine.start()

import { createScene } from '../scene-utils/create-scene'
import { Engine } from '../classes/engine'
import { createCube } from '../scene-utils/create-cube'
import { Message } from '../classes/message'

const { ambientLight, directionalLight, filmWindow, characterWindow, scene, renderer } =
  createScene()
filmWindow.camera.position.z = 8
characterWindow.camera.position.z = 5

const cube = createCube()

const message = new Message('message-box', [], 20, 20, 300, 100)
message.renderDiv()

message
  .typewriterEffect(['Welcome to Introspective <b>Briscola!</b>', ' This is a message box.'])
  .then(() => {
    message.moveTo(20, 140)
  })

characterWindow.moveWithGsap(400, 30, 0.5)

const engine = new Engine(
  scene,
  renderer,
  [filmWindow, characterWindow],
  [cube],
  [ambientLight, directionalLight]
)

engine.start()

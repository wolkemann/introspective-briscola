import * as THREE from 'three'
import { FilmWindow } from './film-window'
import { VIEW } from '../constants'
import { TransformControls } from 'three/addons/controls/TransformControls.js'

enum MODE {
  EDIT = 'EDIT',
  PLAY = 'PLAY'
}

export class Engine {
  mode: MODE
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  views: FilmWindow[]
  meshes: THREE.Mesh[]
  sceneObjects: THREE.Object3D[]
  sceneObjectIndex: number

  edit_transformControls: TransformControls

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    views: FilmWindow[],
    meshes: THREE.Mesh[] = []
  ) {
    this.mode = MODE.EDIT

    this.scene = scene
    this.renderer = renderer
    this.views = views
    this.meshes = meshes

    this.sceneObjects = [...this.views.map((view) => view.camera), ...this.meshes]
    this.sceneObjectIndex = 0

    this.edit_transformControls = new TransformControls(
      this.getViews(VIEW.MAIN).camera,
      this.renderer.domElement
    )

    this.views.forEach((view) => {
      this.scene.add(view.camera)
    })
    this.meshes.forEach((mesh) => {
      this.scene.add(mesh)
    })
    this.scene.add(this.edit_transformControls.getHelper())

    this.attachWindowResizeListener()

    if (this.mode !== MODE.EDIT) return
    this.attachObjectControlsHotkeysEventListener()
  }

  getViews(id: VIEW): FilmWindow {
    const view = this.views.find((view) => view.id === id)
    if (!view) throw new Error(`FilmWindow with id ${id} not found`)

    return view
  }

  attachObjectControlsHotkeysEventListener(): void {
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Tab': {
          event.preventDefault()
          this.sceneObjectIndex = (this.sceneObjectIndex + 1) % this.sceneObjects.length
          const selectedObject = this.sceneObjects[this.sceneObjectIndex]
          this.edit_transformControls.attach(selectedObject)
          break
        }
        case 't':
          this.edit_transformControls.setMode('translate')
          break
        case 'r':
          this.edit_transformControls.setMode('rotate')
          break
        case 's':
          this.edit_transformControls.setMode('scale')
          break
      }
    })
  }

  attachWindowResizeListener(): void {
    window.addEventListener('resize', () => {
      const sw = window.innerWidth
      const sh = window.innerHeight

      // 1. Aggiorna il renderer principale
      this.renderer.setSize(sw, sh)
      this.renderer.setPixelRatio(window.devicePixelRatio)

      // 2. Chiedi a ogni finestra di ricalcolarsi
      this.getViews(VIEW.MAIN).handleResize(sw, sh)
      this.getViews(VIEW.CHARACTER).handleResize(sw, sh)
    })
  }

  renderViews(): void {
    this.views.forEach((view) => {
      if (!view.visible) return
      this.renderer.setViewport(view.x, view.y, view.width, view.height)
      this.renderer.setScissor(view.x, view.y, view.width, view.height)
      this.renderer.setScissorTest(true)

      this.renderer.render(this.scene, view.camera)
    })
  }

  start(): void {
    this.renderer.setAnimationLoop((time) => this.frame(time))
  }

  frame(time: number): void {
    this.renderViews()
  }
}

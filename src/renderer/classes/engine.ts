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
  lights: THREE.Light[]
  sceneObjectIndex: number

  edit_transformControls: TransformControls

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    views: FilmWindow[],
    meshes: THREE.Mesh[] = [],
    lights: THREE.Light[] = []
  ) {
    this.mode = MODE.EDIT

    this.scene = scene
    this.renderer = renderer
    this.views = views
    this.meshes = meshes
    this.lights = lights
    this.sceneObjectIndex = 0

    this.edit_transformControls = new TransformControls(
      this.getView(VIEW.MAIN).camera,
      this.renderer.domElement
    )

    this.addAllSceneObjectsToScene()
    this.scene.add(this.edit_transformControls.getHelper())

    console.log(this.edit_transformControls.getHelper())

    this.attachWindowResizeListener()

    if (this.mode !== MODE.EDIT) return
    this.edit_addSceneObjectsHelpersToScene()
    this.edit_attachObjectControlsHotkeysEventListener()
  }

  get transformableObjects(): THREE.Object3D[] {
    return this.scene.children.filter((obj) => {
      return obj instanceof THREE.Mesh || obj instanceof THREE.Camera || obj instanceof THREE.Light
    })
  }

  addAllSceneObjectsToScene(): void {
    this.views.forEach((view) => {
      this.scene.add(view.camera)
    })
    this.meshes.forEach((mesh) => {
      this.scene.add(mesh)
    })
    this.lights.forEach((light) => {
      this.scene.add(light)
    })
  }

  getView(id: VIEW): FilmWindow {
    const view = this.views.find((view) => view.id === id)
    if (!view) throw new Error(`[ENGINE] FilmWindow with id ${id} not found`)

    return view
  }

  attachWindowResizeListener(): void {
    window.addEventListener('resize', () => {
      const sw = window.innerWidth
      const sh = window.innerHeight

      this.renderer.setSize(sw, sh)
      this.renderer.setPixelRatio(window.devicePixelRatio)

      this.getView(VIEW.MAIN).handleResize(sw, sh)
      this.getView(VIEW.CHARACTER).handleResize(sw, sh)
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
    this.edit_updatedAllObjectsHelpers()
  }

  edit_addSceneObjectsHelpersToScene(): void {
    this.views.forEach((view) => {
      const cameraHelper = new THREE.CameraHelper(view.camera)
      cameraHelper.name = `${view.camera.name}_Helper`
      this.scene.add(cameraHelper)
    })
    this.meshes.forEach((mesh) => {
      const boxHelper = new THREE.BoxHelper(mesh, 0xffff00)
      boxHelper.name = `${mesh.name || mesh.type}_BoxHelper`
      this.scene.add(boxHelper)
    })
    this.lights.forEach((light) => {
      let lightHelper: THREE.Object3D | null = null
      if (light instanceof THREE.PointLight) {
        lightHelper = new THREE.PointLightHelper(light, 0.5)
      } else if (light instanceof THREE.DirectionalLight) {
        lightHelper = new THREE.DirectionalLightHelper(light, 0.5)
      } else if (light instanceof THREE.SpotLight) {
        lightHelper = new THREE.SpotLightHelper(light)
      }
      if (lightHelper) {
        lightHelper.name = `${light.name || light.type}_Helper`
        this.scene.add(lightHelper)
      }
    })
  }

  edit_updatedAllObjectsHelpers(): void {
    if (this.mode !== MODE.EDIT) return
    this.scene.traverse((child) => {
      if (child instanceof THREE.CameraHelper) {
        child.update()
      }
      if (child instanceof THREE.BoxHelper) {
        child.update()
      }
      if (child instanceof THREE.PointLightHelper) {
        child.update()
      }
      if (child instanceof THREE.DirectionalLightHelper) {
        child.update()
      }
      if (child instanceof THREE.SpotLightHelper) {
        child.update()
      }
    })
  }

  edit_attachObjectControlsHotkeysEventListener(): void {
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Tab': {
          event.preventDefault()
          this.sceneObjectIndex = (this.sceneObjectIndex + 1) % this.transformableObjects.length
          const selectedObject = this.transformableObjects[this.sceneObjectIndex]
          this.edit_transformControls.attach(selectedObject)
          console.debug(
            `[ENGINE] Selected object: ${selectedObject.name || selectedObject.type} (index: ${this.sceneObjectIndex})`
          )
          break
        }
        case '\\': {
          const selectedObject = this.transformableObjects[this.sceneObjectIndex]
          const selectedObijectInfo = {
            name: selectedObject.name || 'Unnamed Object',
            type: selectedObject.type,
            position: selectedObject.position,
            rotation: selectedObject.rotation,
            scale: selectedObject.scale
          }
          console.debug(`[ENGINE] Selected object info:`, selectedObijectInfo)
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
}

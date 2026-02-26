import * as THREE from 'three'
import { VIEW } from '../constants'

export class FilmWindow {
  id: string
  visible: boolean

  x: number
  y: number
  width: number
  height: number
  ratioX: number
  ratioY: number
  ratioW: number
  ratioH: number

  camera: THREE.PerspectiveCamera

  constructor(id: string, x: number, y: number, width: number, height: number) {
    this.id = id
    this.visible = true
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.ratioX = x / window.innerWidth
    this.ratioY = y / window.innerHeight
    this.ratioW = width / window.innerWidth
    this.ratioH = height / window.innerHeight

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  }

  updatePosition(x: number, y: number): void {
    this.x = x
    this.y = y
    if (this.id === VIEW.MAIN) return
    const windowDiv = document.getElementById(this.id)
    if (windowDiv) {
      windowDiv.style.left = `${x}px`
      windowDiv.style.bottom = `${y}px`
    }
  }

  updateAspect(width: number, height: number): void {
    this.width = width
    this.height = height
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    if (this.id === VIEW.MAIN) return
    const windowDiv = document.getElementById(this.id)
    if (windowDiv) {
      windowDiv.style.width = `${width}px`
      windowDiv.style.height = `${height}px`
    }
  }

  renderDiv(): void {
    if (this.id === VIEW.MAIN || !this.visible) return
    const windowDiv = document.createElement('div')
    windowDiv.id = this.id
    windowDiv.style.position = 'absolute'
    windowDiv.style.left = `${this.x}px`
    windowDiv.style.bottom = `${this.y}px`
    windowDiv.style.width = `${this.width}px`
    windowDiv.style.height = `${this.height}px`
    windowDiv.style.border = '3px solid #000'
    document.body.appendChild(windowDiv)
  }

  handleResize(screenWidth: number, screenHeight: number): void {
    if (this.id === VIEW.MAIN) {
      this.width = screenWidth
      this.height = screenHeight
      this.x = 0
      this.y = 0
    } else {
      // Proporzionalità pura
      this.x = screenWidth * this.ratioX
      this.y = screenHeight * this.ratioY
      this.width = screenWidth * this.ratioW
      this.height = screenHeight * this.ratioH
    }

    // Aggiorna Camera
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    // Aggiorna DIV (Bordi)
    const windowDiv = document.getElementById(this.id)
    if (windowDiv) {
      windowDiv.style.left = `${this.x}px`
      windowDiv.style.bottom = `${this.y}px`
      windowDiv.style.width = `${this.width}px`
      windowDiv.style.height = `${this.height}px`
    }
  }
}

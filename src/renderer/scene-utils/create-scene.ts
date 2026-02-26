import * as THREE from 'three'
import { FilmWindow } from '../classes/film-window'
import { VIEW } from '../constants'

export function createScene(): {
  filmWindow: FilmWindow
  characterWindow: FilmWindow
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
} {
  const filmWindow = new FilmWindow(VIEW.MAIN, 0, 0, window.innerWidth, window.innerHeight)
  const characterWindow = new FilmWindow(VIEW.CHARACTER, 200, 30, 320, 240)

  filmWindow.renderDiv()
  characterWindow.renderDiv()

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2e2e2e)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(5, 10, 7.5)
  scene.add(directionalLight)

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  const sceneDiv = document.getElementById('scene')
  sceneDiv?.appendChild(renderer.domElement)

  return { filmWindow, characterWindow, scene, renderer }
}

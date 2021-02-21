/*
Usage:
createViewer({el: 'scene'})
*/

import { EARTH_RADIUS } from './constants.js'
// import * as THREE from './three.js'
import { OrbitControls, PerspectiveCamera, WebGLRenderer, Scene, AmbientLight } from './three.js'

export const SETTINGS = {
  el: 'webgl',
  cameraDistance: EARTH_RADIUS
}

export const createViewer = (_settings = SETTINGS) => {
  // Merge settings
  const settings = {
    ...SETTINGS,
    ..._settings
  }

  const { el, cameraDistance } = settings

  var webglEl = document.getElementById(el)

  var width = webglEl.offsetWidth
  var height = webglEl.offsetHeight || window.innerHeight

  var scene = new Scene()

  const far = -1 // 100000
  var camera = new PerspectiveCamera(45, width / height, 0.01, far)
  camera.position.x = 1 * cameraDistance
  camera.position.y = 1 * cameraDistance
  camera.position.z = 1 * cameraDistance
  // camera.position.z = 2 * EARTH_RADIUS

  var renderer = new WebGLRenderer({
    antialias: true
  })
  renderer.shadowMap.enabled = true
  renderer.setSize(width, height)

  // Lights
  scene.add(new AmbientLight(0x333333))

  const Controls =
    OrbitControls
  // TrackballControls

  var controls = new Controls(camera, renderer.domElement)

  webglEl.appendChild(renderer.domElement)

  function render (timestamp) {
    // console.log(timestamp)

    controls.update()

    requestAnimationFrame(render)
    renderer.render(scene, camera)
  }

  // Handle resize
  window.addEventListener('resize', onWindowResize, false)
  function onWindowResize () {
    // window.innerWidth / window.innerHeight
    var width = webglEl.offsetWidth
    var height = webglEl.offsetHeight || window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  const addOrbitDampControl = () => {
    controls.rotateSpeed = 0.5
    controls.zoomSpeed = 0.5
    // controls.panSpeed = 10
    controls.minDistance = EARTH_RADIUS
    // controls.enableDamping = true
    // controls.maxZoom = 10000

    controls.addEventListener('change', (e) => {
      const distance = camera.position.distanceTo(controls.target)
      const distanceToPlanet = distance - EARTH_RADIUS

      // Controls - Pan speed depends on zoom
      controls.rotateSpeed = Math.min(distanceToPlanet / EARTH_RADIUS, 3)
      controls.zoomSpeed = Math.min(distanceToPlanet / EARTH_RADIUS, 3)
    }, false)
  }

  // Start render
  render()

  return {
    // THREE,
    scene,
    camera,
    controls,
    renderer,
    settings,
    // TEMP
    addOrbitDampControl
  }
}

import * as THREE from './three.js'
import { OrbitControls } from './three.js'
import { fitCameraToObject } from './camera.js'

const SETTINGS = {
  el: 'webgl',
  sphereRotation: 0.0002,
  clouds: {
    rotation: {
      x: 0.001,
      y: 0.0005
    },
    height: 1000
  }
}

export class Viewer {
  constructor (_settings = SETTINGS) {
    // Merge settings
    const settings = {
      ...SETTINGS,
      ..._settings
    }

    const { el } = settings

    var container = document.getElementById(el)

    var width = window.innerWidth
    var height = window.innerHeight

    var scene = new THREE.Scene()

    const near = 1
    const far = 5000
    var camera = new THREE.PerspectiveCamera(45, width / height, near, far)
    camera.position.z = 1.5

    var renderer = new THREE.WebGLRenderer({
      antialias: true
      // logarithmicDepthBuffer: true
    })
    renderer.setSize(width, height)

    // Lighs
    scene.add(new THREE.AmbientLight(0x333333))
    var light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 3, 5)
    scene.add(light)

    // https://stackoverflow.com/questions/18813481/three-js-mousedown-not-working-when-trackball-controls-enabled
    // make sure that your container.append(renderer.domElement); is executed before initializing THREE.TrackballControls( camera, renderer.domElement );
    container.appendChild(renderer.domElement)

    // Controls
    const Controls =
      OrbitControls
    // TrackballControls
    var controls = new Controls(camera, container)
    // var controls = new Controls(camera, renderer.domElement)
    // controls.rotateSpeed = 1.0
    // controls.zoomSpeed = 1.2
    // controls.panSpeed = 0.8

    function render () {
      if (controls) {
        controls.update()
      }

      requestAnimationFrame(render)
      renderer.render(scene, camera)
    }
    render()

    // Handle resize
    window.addEventListener('resize', onWindowResize, false)
    function onWindowResize () {
    // window.innerWidth / window.innerHeight
      var width = container.offsetWidth
      var height = container.offsetHeight || window.innerHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    Object.assign(this, {
      el: container,
      THREE,
      scene,
      controls,
      renderer,
      camera,
      settings
    })
  }

  zoomTo (what = {}) {
    // console.log('zoomTo', what, this)
    fitCameraToObject(what, this)
  }
}

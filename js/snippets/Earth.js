import * as THREE from './three.js'
import { OrbitControls } from './three.js'
import Clouds from './Clouds.js'
import Stars from './Stars.js'
import Sky from './Sky.js'

export function createSphere (radius, segments) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    new THREE.MeshPhongMaterial({
      // 4k
      // map: new THREE.TextureLoader().load('/images/2_no_clouds_4k.jpg'),
      // bumpMap: new THREE.TextureLoader().load('/images/elev_bump_4k.jpg'),
      // bumpScale: 0.005,
      // specularMap: new THREE.TextureLoader().load('/images/water_4k.png'),
      // specular: new THREE.Color('grey')

      // 10k
      map: new THREE.TextureLoader().load('/images/earthmap10k.jpg'),
      // map: new THREE.TextureLoader().load('/images/earthlights10k.jpg'),
      bumpMap: new THREE.TextureLoader().load('/images/earthbump10k.jpg'),
      bumpScale: 0.005,
      specularMap: new THREE.TextureLoader().load('/images/earthspec10k.jpg'),
      specular: new THREE.Color('grey')
    })
  )
  mesh.name = 'sphere'
  return mesh
}

const SETTINGS = {
  el: 'webgl',
  sphereRotation: 0, // 0.0002,
  clouds: {
    rotation: {
      // x: 0.001,
      // y: 0.0005
    },
    height: 1000
  }
}

export default class Earth {
  constructor (_settings = SETTINGS) {
    // Merge settings
    const settings = {
      ...SETTINGS,
      ..._settings
    }

    const { el } = settings

    var webglEl = document.getElementById(el)

    var width = window.innerWidth
    var height = window.innerHeight

    // Earth params
    const { radius = 0.5 } = _settings
    var segments = 32
    var rotation = 6

    var scene = new THREE.Scene()

    const far = 100000
    var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, far)
    camera.position.z = radius * 3 // 1.5

    var renderer = new THREE.WebGLRenderer()
    renderer.setSize(width, height)

    // Lighs
    scene.add(new THREE.AmbientLight(0x333333))
    var light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 3, 5)
    scene.add(light)

    const clouds = new Clouds({ THREE })
    scene.add(clouds.mesh)

    const sky = new Sky({ THREE, renderer, scene })
    scene.add(sky.mesh)

    var sphere = createSphere(radius, segments)
    sphere.rotation.y = rotation
    // sphere.visible = false
    scene.add(sphere)

    // const waterGeometry =
    //   // new THREE.PlaneBufferGeometry(10000, 10000)
    //   new THREE.SphereGeometry(100, segments, segments)
    // // const water = applyWaterMaterial(waterGeometry)
    // // scene.add(water)
    // var water = new Water({ waterGeometry, THREE })
    // scene.add(water.mesh)

    var stars = new Stars({ radius: 90, segments: 64, THREE }).mesh
    // stars.visible = false
    scene.add(stars)

    const Controls =
      OrbitControls
    // TrackballControls

    var controls = new Controls(camera, renderer.domElement)
    // controls.rotateSpeed = 1.0
    // controls.zoomSpeed = 1.2
    // controls.panSpeed = 0.8

    webglEl.appendChild(renderer.domElement)

    function render () {
      controls.update()

      sphere.rotation.y += settings.sphereRotation || 0.0002

      // water.material.uniforms['time'].value += 1.0 / 60.0
      // water.render()

      requestAnimationFrame(render)
      renderer.render(scene, camera)
    }

    render()

    // Object.freeze(settings)

    Object.assign(this, {
      THREE,
      scene,
      clouds,
      sphere,
      radius,
      controls,
      renderer,
      settings: settings
    })
  }
}

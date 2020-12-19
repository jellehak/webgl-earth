import * as THREE from 'https://unpkg.com/three@0.123.0/build/three.module.js'
import { TrackballControls } from 'https://unpkg.com/three@0.123.0/examples/jsm/controls/TrackballControls.js'

function createSphere (radius, segments) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('/images/2_no_clouds_4k.jpg'),
      bumpMap: new THREE.TextureLoader().load('/images/elev_bump_4k.jpg'),
      bumpScale: 0.005,
      specularMap: new THREE.TextureLoader().load('/images/water_4k.png'),
      specular: new THREE.Color('grey')
    })
  )
}

function createClouds (radius, segments) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius + 0.003, segments, segments),
    new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('/images/fair_clouds_4k.png'),
      transparent: true
    })
  )
}

function createStars (radius, segments) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('/images/galaxy_starfield.png'),
      side: THREE.BackSide
    })
  )
}

const SETTINGS = {
  el: 'webgl'
}

export default (_settings = SETTINGS) => {
  const { el } = {
    ...SETTINGS,
    ..._settings
  }

  var webglEl = document.getElementById(el)

  var width = window.innerWidth
  var height = window.innerHeight

  // Earth params
  const { radius = 0.5 } = _settings
  //   var radius = 0.5
  var segments = 32
  var rotation = 6

  var scene = new THREE.Scene()

  const far = 100000
  var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, far)
  camera.position.z = 1.5

  var renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)

  scene.add(new THREE.AmbientLight(0x333333))

  var light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(5, 3, 5)
  scene.add(light)

  var sphere = createSphere(radius, segments)
  sphere.rotation.y = rotation
  scene.add(sphere)

  var clouds = createClouds(radius, segments)
  clouds.rotation.y = rotation
  scene.add(clouds)

  var stars = createStars(90, 64)
  scene.add(stars)

  var controls = new TrackballControls(camera, renderer.domElement)

  webglEl.appendChild(renderer.domElement)

  function render () {
    controls.update()
    sphere.rotation.y += 0.0002
    clouds.rotation.y += 0.0005
    requestAnimationFrame(render)
    renderer.render(scene, camera)
  }

  render()

  return { scene, clouds, sphere, radius, controls, renderer }
}

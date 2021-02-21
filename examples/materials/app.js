// https://threejs.org/examples/?q=materials#webgl_materials_physical_clearcoat
import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js'
import Stats from 'https://unpkg.com/three@0.125.0/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'https://unpkg.com/three@0.125.0/examples/jsm/controls/OrbitControls.js'
// import { HDRCubeTextureLoader } from 'https://unpkg.com/three@0.125.0/examples/jsm/loaders/HDRCubeTextureLoader.js'
// import { FlakesTexture } from 'https://unpkg.com/three@0.125.0/examples/jsm/textures/FlakesTexture.js'

let container, stats

let camera, scene, renderer

let particleLight
let group

init()
animate()

function init () {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 1000

  scene = new THREE.Scene()

  group = new THREE.Group()
  scene.add(group)

  async function setup (hdrCubeMap) {
    const geometry = new THREE.SphereGeometry(80, 64, 32)

    // car paint
    // instantiate a loader

    const material = new THREE.MeshPhysicalMaterial()

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = -100
    mesh.position.y = 100
    group.add(mesh)

    mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = -100
    mesh.position.y = -100
    group.add(mesh)

    // load remote material
    const resp = new THREE.MaterialLoader().load(
      'carpaint.json',
      // 'carbon.json',
      function (material) {
        console.log(material)
        mesh.material = material
      }
    )
    // fetch('carbon.json')
    //     .then(elem => elem.json())
    //     .then(elem => {
    //         console.log(elem)
    //     })
    //
  }

  scene.add(new THREE.AmbientLight(0x333333))

  setup()

  // LIGHTS

  particleLight = new THREE.Mesh(
    new THREE.SphereGeometry(4, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  scene.add(particleLight)

  particleLight.add(new THREE.PointLight(0xffffff, 1))

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  //

  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25

  //

  renderer.outputEncoding = THREE.sRGBEncoding

  //

  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  //

  stats = new Stats()
  container.appendChild(stats.dom)

  // EVENTS

  const controls = new OrbitControls(camera, renderer.domElement)

  window.addEventListener('resize', onWindowResize)
}

//

function onWindowResize () {
  const width = window.innerWidth
  const height = window.innerHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
}

//

function animate () {
  requestAnimationFrame(animate)

  render()

  stats.update()
}

function render () {
  const timer = Date.now() * 0.00025

  particleLight.position.x = Math.sin(timer * 7) * 300
  particleLight.position.y = Math.cos(timer * 5) * 400
  particleLight.position.z = Math.cos(timer * 3) * 300

  for (let i = 0; i < group.children.length; i++) {
    const child = group.children[i]
    child.rotation.y += 0.005
  }

  renderer.render(scene, camera)
}

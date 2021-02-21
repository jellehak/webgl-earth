import { createViewer, SceneManager, THREE } from '../../js/index.js'
import { Water } from 'https://unpkg.com/three@0.125.0/examples/jsm/objects/Water2.js'

function mounted () {
  const viewer = createViewer({ el: 'webgl' })

  const { scene } = viewer

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  const textureLoader = new THREE.TextureLoader()

  // ground

  const groundGeometry = new THREE.PlaneGeometry(20, 20)
  const groundMaterial = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.4 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = Math.PI * -0.5
  scene.add(ground)
  textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg', function (map) {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.anisotropy = 16
    map.repeat.set(4, 4)
    groundMaterial.map = map
    groundMaterial.needsUpdate = true
  })

  // Water

  const params = {
    color: '#ffffff',
    scale: 4,
    flowX: 1,
    flowY: 1
  }
  const waterGeometry = new THREE.PlaneGeometry(20, 20)
  const water = new Water(waterGeometry, {
    color: params.color,
    scale: params.scale,
    flowDirection: new THREE.Vector2(params.flowX, params.flowY),
    textureWidth: 1024,
    textureHeight: 1024,
    normalMap0: textureLoader.load('https://threejs.org/examples/textures/water/Water_1_M_Normal.jpg'),
    normalMap1: textureLoader.load('https://threejs.org/examples/textures/water/Water_2_M_Normal.jpg')
  })
  water.position.y = 1
  water.rotation.x = Math.PI * -0.5
  scene.add(water)

  // light

  const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
  directionalLight.position.set(-1, 1, 1)
  scene.add(directionalLight)
}

mounted()

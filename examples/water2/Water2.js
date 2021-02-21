import { Water } from 'https://unpkg.com/three@0.125.0/examples/jsm/objects/Water2.js'

export default ({ THREE, geometry }) => {
  const textureLoader = new THREE.TextureLoader()
  const params = {
    color: '#ffffff',
    scale: 4,
    flowX: 1,
    flowY: 1
  }
  const _geometry = geometry || new THREE.PlaneGeometry(2000, 2000)

  const water = new Water(_geometry, {
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
  return water
}

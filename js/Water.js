import { Water as WaterShader } from 'https://unpkg.com/three@0.123.0/examples/jsm/objects/Water.js'

// // https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html
// function applyWaterMaterial (waterGeometry) {
//   // const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000)

//   // scene.add( water );
//   return water
// }

export default class Water {
  constructor ({ waterGeometry, THREE } = {}) {
    const water = new WaterShader(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('https://threejs.org/examples/textures/waternormals.jpg', function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        }),
        alpha: 1.0,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7
        // fog: scene.fog !== undefined
      }
    )
    water.rotation.x = -Math.PI / 2

    water.name = 'water'
    this.mesh = water
  }

  render () {
    const { mesh } = this

    mesh.material.uniforms['time'].value += 1.0 / 60.0
  }
}

// var clouds = createClouds(radius + settings.clouds.height / 10000, segments)
// clouds.rotation.y = rotation
// scene.add(clouds)

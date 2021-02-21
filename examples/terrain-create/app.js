import { createViewer, THREE, SceneManager } from '../../js/index.js'
import * as Planets from '../../js/index.js'
import { createTerrain } from './createTerrain.js'
// import createGrass from './materials/Grass.js'

function mounted () {
  const viewer = createViewer({ el: 'webgl' })

  const { scene } = viewer

  const manager = new SceneManager(viewer)

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  // const terrain = new Planets.Terrain({
  //   map: '/images/elev_bump_4k.jpg',
  //   // map: '/images/8081_Planetsbump10k.jpg',
  //   bumpScale: 50
  // })
  // manager.push(terrain)

  const terrain = createTerrain({ THREE })
  scene.add(terrain)

  var terrainMaterial = new THREE.MeshPhongMaterial({
    color: 'green',
    // vertexColors: THREE.VertexColors,
    flatShading: true,
    side: THREE.DoubleSide
  })
  terrain.material = terrainMaterial
  // var terrain = new THREE.Mesh(terrainGeo, terrainMaterial)
  // // terrain.position.y = -inParameters.depth * 0.4
  // this.ms_Scene.add(terrain)

  // scene.add(createGrass(THREE))

  // manager.push(new Planets.Sky(viewer))

  // Water
  const waterObj = new Planets.Water()
  waterObj.mesh.position.y = this.waterHeight
  // const water = waterObj.mesh
  manager.push(waterObj)

  // LIGHTS
  const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02)
  scene.add(hemiLight)

  const particleLight = new THREE.Mesh(
    new THREE.SphereGeometry(4, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  scene.add(particleLight)
  particleLight.add(new THREE.PointLight(0xffffff, 1))

  manager.push({
    render () {
      const timer = Date.now() * 0.00025

      particleLight.position.x = Math.sin(timer * 7) * 300
      particleLight.position.y = Math.cos(timer * 5) * 400 + 1000
      particleLight.position.z = Math.cos(timer * 3) * 300
    }
  })

  // Vue binding
  this.$watch('form.bumpScale', v => { terrain.bumpScale = v })
}

const vue = new Vue({
  el: '#app',
  data: vm => ({
    form: {
      waterHeight: 0,
      bumpScale: 0,
      // radius: 1 // 6371
      types: null
    }
  }),
  mounted,
  vuetify: new window.Vuetify({
    theme: { dark: window.matchMedia('(prefers-color-scheme: dark)').matches }
  })
})

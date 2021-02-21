import { createViewer, SceneManager } from '../../js/index.js'
import * as Planets from '../../js/index.js'
import { createTerrain } from './createTerrain.js'

function mounted () {
  const viewer = createViewer({ el: 'webgl' })

  const { scene, THREE } = viewer

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
  // var terrainGeo = TERRAINGEN.Get(inParameters)
  // var terrainMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, shading: THREE.FlatShading, side: THREE.DoubleSide })

  // var terrain = new THREE.Mesh(terrainGeo, terrainMaterial)
  // // terrain.position.y = -inParameters.depth * 0.4
  // this.ms_Scene.add(terrain)

  manager.push(new Planets.Sky(viewer))

  const waterObj = new Planets.Water()
  // waterObj.mesh.position.y = this.waterHeight
  // const water = waterObj.mesh
  manager.push(waterObj)
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

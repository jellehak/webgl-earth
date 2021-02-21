import { createViewer, SceneManager, THREE } from '../../js/index.js'
import * as Planets from '../../js/index.js'

function mounted () {
  const viewer = createViewer({ el: 'webgl' })

  const { scene } = viewer

  const manager = new SceneManager(viewer)

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  const terrain = new Planets.Terrain({
    map: '/images/elev_bump_4k.jpg',
    // map: '/images/8081_Planetsbump10k.jpg',
    bumpScale: 50
  })
  manager.push(terrain)

  manager.push(new Planets.Sky(viewer))

  const waterObj = new Planets.Water()
  waterObj.mesh.position.y = this.waterHeight
  const water = waterObj.mesh
  manager.push(waterObj)

  // const waterGeo = new THREE.PlaneGeometry(1000, 1000, 1, 1) // planeGeo
  // var waterTex = new THREE.TextureLoader().load('https://stemkoski.github.io/Three.js/images/water512.jpg')
  // waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping
  // waterTex.repeat.set(5, 5)
  // var waterMat = new THREE.MeshBasicMaterial({ map: waterTex, transparent: true, opacity: 0.40 })
  // var water = new THREE.Mesh(waterGeo, waterMat)
  // water.rotation.x = -Math.PI / 2
  // // water.position.y = -50
  // scene.add(water)

  // Expose
  window.scene = scene
  window.THREE = THREE

  // Vue bindings
  this.form.types = terrain.types
  this.$watch('form.types', (value) => {
    terrain.types = value
  }, { deep: true })

  this.$watch('form.waterHeight', (value) => {
    water.position.y = value
  })
  this.$watch('form.bumpScale', (value) => {
    terrain.bumpScale = value
  })
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

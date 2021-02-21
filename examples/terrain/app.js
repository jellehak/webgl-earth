import { addOrbitDampControl } from '../../js/camera.js'
import { SceneManager, Viewer, Planet, THREE, Constants, ArcGISTiledElevationTerrainProvider, createEarthMaterial } from '../../js/index.js'

export const createWireframe = (geometry = {}) => {
  const wireframe = new THREE.WireframeGeometry(geometry)
  const line = new THREE.LineSegments(wireframe)
  line.material.depthTest = false
  // line.material.opacity = 0.25
  line.material.color = new THREE.Color('red')
  line.material.transparent = true
  return line
}

function mounted () {
  const viewer = new Viewer({ el: 'webgl' })
  const manager = new SceneManager(viewer)
  const { scene } = viewer

  // Helper
  scene.add(new THREE.AxesHelper(Constants.EARTH_RADIUS))

  // Planet
  const planet = new Planet()
  planet.terrainProvider = new ArcGISTiledElevationTerrainProvider({
    url:
      'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'
  })

  manager.add(planet)
  viewer.zoomTo(planet.mesh)

  addOrbitDampControl(viewer)

  // Controls
  // viewer.controls.enabled = false

  // Wireframe
  // const wireframe = createWireframe(planet.mesh.geometry)
  // const { geometry } = wireframe
  // scene.add(wireframe)

  // LIGHT
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

  this.apply = () => {
    console.log('New Terrain')

    // planet.mesh.material = createEarthMaterial()
  }
}

const vue = new Vue({
  el: '#app',
  data: vm => ({
    form: {
      waterHeight: 0,
      bumpScale: 0,
      types: null
    }
  }),
  mounted,
  methods: {
    apply () { this.apply() },
    log (msg = 'cool') { console.log(msg) }
  },
  vuetify: new window.Vuetify({
    theme: { dark: window.matchMedia('(prefers-color-scheme: dark)').matches }
  })
})

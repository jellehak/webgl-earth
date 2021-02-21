import { createViewer, createEarthMaterial, THREE, Planet, SceneManager, getPosition, Constants } from '../../js/index.js'
import '../assets/vue-ace-edit.js'

const maps = [
  { text: 'virtualearth-4k' },
  { text: 'virtualearth-10k' }
]

window.vue = new window.Vue({
  el: '#app',

  data: vm => ({
    maps,
    form: {
      map: ''
      // radius: 1 // 6371
    }
  }),

  mounted () {
    const viewer = createViewer({ el: 'webgl' })
    const { scene } = viewer

    viewer.addOrbitDampControl()

    const manager = new SceneManager(viewer)

    const planet = new Planet()
    planet.mesh.material = createEarthMaterial({ quality: '4k' })
    manager.push(planet)

    // Box
    const xyz = getPosition(2, 52)
    const geometry = new THREE.BoxGeometry(1000, 1000, 1000)
    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))
    object.position.set(...xyz)
    scene.add(object)

    // Line
    const createLine = () => {
      // create a blue LineBasicMaterial
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff })

      const points = []
      points.push(new THREE.Vector3(-10, 0, 0))
      points.push(new THREE.Vector3(0, 10, 0))
      points.push(new THREE.Vector3(10, 0, 0))
      const geometry = new THREE.BufferGeometry().setFromPoints(points)

      const line = new THREE.Line(geometry, material)
      return line
    }

    scene.add(createLine())

    // Lights
    scene.add(new THREE.AmbientLight(0x333333))
    var light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 3, 5)
    scene.add(light)

    // const terrain = new TerrainProvider({})

    scene.add(new THREE.AxesHelper(Constants.EARTH_RADIUS * 1.5))

    // Vue bindings
    // this.$watch('form', value => {
    //   console.log('compile', value)
    //   // earth.settings = value
    //   Object.assign(earth.settings, value)
    // })
    this.$watch('form.map', value => {
      console.log('map', value)
      const mapProviders = {
        'virtualearth-4k' () {
          return createEarthMaterial({ quality: '4k' })
        },
        'virtualearth-10k' () {
          return createEarthMaterial({ quality: '10k' })
        }
      }
      const fn = mapProviders[value] || mapProviders['virtualearth-4k']
      planet.mesh.material = fn()
    })
  },
  vuetify: new window.Vuetify()
})

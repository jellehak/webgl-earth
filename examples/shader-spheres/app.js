import { createViewer, Planet, THREE, SceneManager } from '../../js/index.js'

window.vue = new window.Vue({
  el: '#app',
  data: vm => ({
    form: {
      radius: 1 // 6371
    }
  }),
  mounted () {
    const viewer = createViewer({ el: 'webgl' })
    const { scene } = viewer

    const manager = new SceneManager(viewer)

    const material = new THREE.ShaderMaterial({
      uniforms: {
        colorB: { type: 'vec3', value: new THREE.Color(0xACB6E5) },
        colorA: { type: 'vec3', value: new THREE.Color(0x74ebd5) }
      },
      vertexShader: `
      varying vec3 vUv; 

        void main() {
        vUv = position; 

        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition; 
        }
        `,
      fragmentShader: `
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      varying vec3 vUv;

      void main() {
        gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
      }
      `
    })

    const planet = new Planet()
    planet.mesh.material = material
    manager.push(planet)

    // const resp = new Planets.Water({
    //   geometry: new THREE.PlaneBufferGeometry(10000, 10000) // planet.mesh
    // })
    // scene.add(resp.mesh)

    // Flat surface
    // const water = new Planets.WaterMaterial(
    //   new THREE.PlaneBufferGeometry(10000, 10000) // planet.mesh
    // )
    // console.log(water)
    // water.rotation.x = -Math.PI / 2
    // scene.add(water)

    // Water
    // scene.add(createWater({ THREE }))

    // const water = new Planets.WaterMaterial()
    // console.log(water)

    // Lighs
    scene.add(new THREE.AmbientLight(0x333333))
    var light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 3, 5)
    scene.add(light)

    // const earth = new Earth(this.form)
    // const terrain = new TerrainProvider({})
    // const { scene, settings, THREE } = earth
    // this.form = settings

    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)

    // Expose
    window.scene = scene
    window.THREE = THREE

    // this.$watch('form', value => {
    //   console.log('compile', value)
    //   // earth.settings = value
    //   Object.assign(earth.settings, value)
    // })
  },
  vuetify: new window.Vuetify()
})

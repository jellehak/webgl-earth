import { createViewer, Water, SceneManager, THREE } from '../../js/index.js'
import * as Planets from '../../js/index.js'

function mounted () {
  const viewer = createViewer({ el: 'webgl' })

  const { scene } = viewer

  const manager = new SceneManager(viewer)

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  manager.push(new Planets.Sky(viewer))
  manager.push(new Water())

  // const resp = new Planets.Water({
  //   geometry: new THREE.PlaneBufferGeometry(10000, 10000) // planet.mesh
  // })
  // console.log(resp)
  // scene.add(resp.mesh)

  // Expose
  window.scene = scene
  window.THREE = THREE
}

mounted()

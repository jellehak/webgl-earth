import { createViewer, THREE } from '../../js/index.js'

function mounted () {
  const earth = createViewer({ el: 'webgl' })

  const { scene } = earth

  // Add a point
  // var dotGeometry = new THREE.Geometry()
  // dotGeometry.vertices.push(new THREE.Vector3(0, 0, 0))
  // var dotMaterial = new THREE.PointsMaterial({ size: 20, sizeAttenuation: false })
  // var dot = new THREE.Points(dotGeometry, dotMaterial)
  // scene.add(dot)

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  // Expose
  window.scene = scene
  window.THREE = THREE
}

mounted()

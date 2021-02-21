import { EARTH_RADIUS } from './constants.js'
import { Box3, Vector3 } from './three.js'

export const addOrbitDampControl = ({ controls, camera }, {
  radius = EARTH_RADIUS,
  rotateSpeed = 0.5,
  zoomSpeed = 0.5
} = {}) => {
  controls.rotateSpeed = rotateSpeed
  controls.zoomSpeed = zoomSpeed
  controls.minDistance = radius
  controls.maxDistance = radius * 4
  controls.enableDamping = true
  // controls.maxZoom = 10000

  controls.addEventListener('change', (e) => {
    const distance = camera.position.distanceTo(controls.target)
    const distanceToPlanet = distance - radius

    // Controls - Pan speed depends on zoom
    controls.rotateSpeed = Math.min(distanceToPlanet / radius, 3)
    controls.zoomSpeed = Math.min(distanceToPlanet / radius, 3)
  }, false)
}

export const fitCameraToObject = function (object, { camera, controls, scene } = {}, offset = 1.5) {
  const boundingBox = new Box3()

  // get bounding box of object - this will be used to setup controls and camera
  boundingBox.setFromObject(object)

  const center = boundingBox.getCenter(new Vector3())
  const size = boundingBox.getSize(new Vector3())

  // get the max side of the bounding box (fits to width OR height as needed )
  const maxDim = Math.max(size.x, size.y, size.z)
  //   const fov = camera.fov * (Math.PI / 180)
  let cameraZ = maxDim // Math.abs(maxDim / 4 * Math.tan(fov * 2))

  cameraZ *= offset // zoom out a little so that objects don't fill the screen

  // Iso
  camera.position.x = cameraZ
  camera.position.y = cameraZ
  camera.position.z = cameraZ

  const minZ = boundingBox.min.z
  const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ
  camera.far = cameraToFarEdge * 3
  camera.updateProjectionMatrix()

  if (controls) {
    // set camera to rotate around center of loaded object
    controls.target = center

    // prevent camera from zooming out far enough to create far plane cutoff
    // controls.maxDistance = cameraToFarEdge * 2

    controls.saveState()
  } else {
    camera.lookAt(center)
  }
}

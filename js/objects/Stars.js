
export default class Clouds {
  constructor ({ radius = 1, segments = 32, THREE } = {}) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('/images/galaxy_starfield.png'),
        side: THREE.BackSide
      })
    )
    mesh.name = 'stars'
    this.mesh = mesh
  }

  render () {
    // const { mesh, settings } = this
    // mesh.rotation.x += settings.rotation.x
    // mesh.rotation.y += settings.rotation.y
  }
}

// var clouds = createClouds(radius + settings.clouds.height / 10000, segments)
// clouds.rotation.y = rotation
// scene.add(clouds)

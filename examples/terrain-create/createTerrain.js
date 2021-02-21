import { generateHeight } from './generateHeight.js'

// return array with height data from img
function getHeightData (img, scale = 1) {
  var canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  var context = canvas.getContext('2d')

  var size = img.width * img.height
  var data = new Float32Array(size)

  context.drawImage(img, 0, 0)

  for (let i = 0; i < size; i++) {
    data[i] = 0
  }

  var imgd = context.getImageData(0, 0, img.width, img.height)
  var pix = imgd.data

  var j = 0
  for (let i = 0; i < pix.length; i += 4) {
    var all = pix[i] + pix[i + 1] + pix[i + 2]
    data[j++] = all / (12 * scale)
  }

  return data
}

export function createTerrain ({ THREE }) {
  const settings = {
    metalness: 1.0,
    roughness: 0.4,
    ambientIntensity: 0.2,
    aoMapIntensity: 1.0,
    envMapIntensity: 1.0,
    displacementScale: 2.436143, // from original model
    normalScale: 1.0
  }

  const material2 = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    // roughness,
    // metalness,
    // roughnessMap,
    // metalnessMap,
    // envMap, // important -- especially for metals!
    // envMapIntensitys
    ...settings
  })

  /*
  The amount of vertices a plane has is (segmentsWidth+1) * (segmentsHeight+1).
  If your image is 10x10 px it will give you 100 values. So you have to divide your plane into 9x9 segments.
      */
  const worldWidth = 256; const worldDepth = 256
  const worldHalfWidth = worldWidth / 2; const worldHalfDepth = worldDepth / 2

  const data = generateHeight(worldWidth, worldDepth)

  var geometry = new THREE.PlaneGeometry(7500, 7500, worldWidth - 1, worldDepth - 1)
  geometry.rotateX(-Math.PI / 2)
  // Material
  var material = new THREE.MeshPhysicalMaterial({
    color: 'green',
    roughness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  })
  const plane = new THREE.Mesh(geometry, material)

  const vertices = geometry.attributes.position.array

  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = data[i] * 10
  }

  // const texture = new THREE.CanvasTexture(data)
  // texture.wrapS = THREE.ClampToEdgeWrapping
  // texture.wrapT = THREE.ClampToEdgeWrapping
  // plane.material = material2 // new THREE.MeshLambertMaterial({ color: 0x0000ff })
  //   // terrain from Image
  //   var img = new Image()
  //   img.onload = function () {
  //     // get height data from img
  //     var data = getHeightData(img)
  //     // console.log(data)

  //     // plane
  //     //   var geometry = new THREE.PlaneGeometry(10, 10, 9, 9)
  //     var texture = new THREE.TextureLoader().load('combined.png')
  //     // var material = new THREE.MeshLambertMaterial({ map: texture })
  //     plane.material = new THREE.MeshLambertMaterial({ map: texture })
  //     // const plane = new THREE.Mesh(geometry, material)
  //     // console.log(plane)

  //     // set height of vertices
  //     const vertices = geometry.attributes.position.array
  //     for (var i = 0; i < vertices.length; i++) {
  //       vertices[i * 3] = data[i] * 100
  //     //   vertices[i].z = data[i]
  //     }
  //   }
  //   // load img source
  //   img.src = 'combined.png'

  return plane
}

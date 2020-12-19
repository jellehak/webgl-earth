import earth from '/js/earth.js'

const { scene } = earth({
  radius: 1 // 6371
})

// Longitude and latitude conversion function, longitude for longitude, latitude for uniqueness, radius for sphere radius
var getPosition = function (longitude, latitude, radius) {
  // Convert longitude and latitude to rad coordinates
  var lg = THREE.Math.degToRad(longitude)
  var lt = THREE.Math.degToRad(latitude)
  var temp = radius * Math.cos(lt)
  // Get x, y, Z coordinates
  var x = temp * Math.sin(lg)
  var y = radius * Math.sin(lt)
  var z = temp * Math.cos(lg)
  return {
    x: x,
    y: y,
    z: z
  }
}

const resp = getPosition(52, 2, 0.5)
console.log(resp)

// ============
const earthBallSize = 0.5
// ============
// Add track function
var addLine = function (v0, v3) {
  var angle = (v0.angleTo(v3) * 180) / Math.PI
  var aLen = angle * 0.5 * (1 - angle / (Math.PI * earthBallSize * parseInt(earthBallSize / 10)))
  var hLen = angle * angle * 1.2 * (1 - angle / (Math.PI * earthBallSize * parseInt(earthBallSize / 10)))
  var p0 = new THREE.Vector3(0, 0, 0)
  // Normal vector
  var rayLine = new THREE.Ray(p0, getVCenter(v0.clone(), v3.clone()))
  // Vertex coordinates
  var vtop = rayLine.at(hLen / rayLine.at(1).distanceTo(p0))
  // Control point coordinates
  var v1 = getLenVcetor(v0.clone(), vtop, aLen)
  var v2 = getLenVcetor(v3.clone(), vtop, aLen)
  // Draw Bezier curve
  var curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3)
  var geometry = new THREE.Geometry()
  geometry.vertices = curve.getPoints(100)
  var line = new MeshLine()
  line.setGeometry(geometry)
  var material = new MeshLineMaterial({
    color: metapLineColor,
    lineWidth: 0.1,
    transparent: true,
    opacity: 1
  })
  return {
    curve: curve,
    lineMesh: new THREE.Mesh(line.geometry, material)
  }
}

addLine(marking.children[0].position, item.position)

// var animateDots = []
// // Line object collection
// var groupLines = new THREE.Object3D()
// // var groupLines = new THREE.Group()
// // line
// marking.children.forEach(function (item) {
//   var line = addLine(marking.children[0].position, item.position)
//   groupLines.add(line.lineMesh)
//   animateDots.push(line.curve.getPoints(metapNum))
// })
// scene.add(groupLines)
// // A ball that slides on the line
// var aGroup = new THREE.Group()
// for (var i = 0; i < animateDots.length; i++) {
//   for (var j = 0; j < markingNum; j++) {
//     var aGeo = new THREE.SphereGeometry(slideBallSize, 10, 10)
//     var aMaterial = new THREE.MeshBasicMaterial({
//       color: slideBallColor,
//       transparent: true,
//       opacity: 1 - j * 0.02
//     })
//     var aMesh = new THREE.Mesh(aGeo, aMaterial)
//     aGroup.add(aMesh)
//   }
// }
// var vIndex = 0
// var firstBool = true
// function animationLine () {
//   aGroup.children.forEach(function (elem, index) {
//     var _index = parseInt(index / markingNum)
//     var index2 = index - markingNum * _index
//     var _vIndex = 0
//     if (firstBool) {
//       _vIndex = vIndex - index2 % markingNum >= 0 ? vIndex - index2 % markingNum : 0
//     } else {
//       _vIndex = vIndex - index2 % markingNum >= 0 ? vIndex - index2 % markingNum : metapNum + vIndex - index2
//     }
//     var v = animateDots[_index][_vIndex]
//     elem.position.set(v.x, v.y, v.z)
//   })
//   vIndex++
//   if (vIndex > metapNum) {
//     vIndex = 0
//   }
//   if (vIndex == metapNum && firstBool) {
//     firstBool = false
//   }
//   requestAnimationFrame(animationLine)
// }
// scene.add(aGroup)

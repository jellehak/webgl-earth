// view-source:https://threejs.org/examples/webgl_materials_grass.html
function generateTexture () {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const context = canvas.getContext('2d')

  for (let i = 0; i < 20000; i++) {
    context.fillStyle = 'hsl(0,0%,' + (Math.random() * 50 + 50) + '%)'
    context.beginPath()
    context.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() + 0.15, 0, Math.PI * 2, true)
    context.fill()
  }

  context.globalAlpha = 0.075
  context.globalCompositeOperation = 'lighter'

  return canvas
}

export default (THREE) => {
  const geometry = new THREE.PlaneGeometry(100, 100)

  const texture = new THREE.CanvasTexture(generateTexture())

  for (let i = 0; i < 15; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.3, 0.75, (i / 15) * 0.4 + 0.1),
      map: texture,
      depthTest: false,
      depthWrite: false,
      transparent: true
    })

    const mesh = new THREE.Mesh(geometry, material)

    mesh.position.y = i * 0.25
    mesh.rotation.x = -Math.PI / 2

    //   scene.add(mesh)
    return mesh
  }
}

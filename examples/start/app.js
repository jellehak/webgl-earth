import Earth from '/js/earth.js'

const { scene, THREE } = new Earth({
  radius: 1 // 6371
})

// Expose
window.scene = scene
// window.THREE = THREE

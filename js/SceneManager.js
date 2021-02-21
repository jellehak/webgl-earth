/*
SceneManager for ThreeJs

# Usage
const manager = new SceneManager({renderer, scene, camera})

manager.push({ mesh: {}, render() { } })
manager.push({ mesh: {}, render() { } })
*/
export class SceneEntity {
  // constructor () { }

  render () {}
}

export default class SceneManager {
  constructor ({ scene } = {}) {
    this.renderers = []
    this.scene = scene

    const render = (delta) => {
      // Call each renderer
      this.renderers.forEach((elem, index) => {
        if (!elem.render) return

        const stop = () => {
          // console.log(elem, index)
          this.renderers.splice(index, 1)
        }
        elem.render(delta, { stop, mesh: elem.mesh })
        // .bind(elem)
      })

      requestAnimationFrame(render)
    }

    render()
  }

  // alias
  add (item = new SceneEntity()) {
    this.push(item)
  }

  push (item = new SceneEntity()) {
    this.renderers.push(item)

    if (item.mesh) {
      this.scene.add(item.mesh)
    }
  }
}

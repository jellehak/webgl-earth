import { createViewer, THREE } from '../../js/index.js'
import '../assets/vue-ace-edit.js'
import examples from './examples.js'

// https://threejsfundamentals.org/threejs/lessons/threejs-shadertoy.html
const shaderToyToThreeShader = (v) => `
// #include <common>

uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform int iFrame;
uniform float iFrameRate;
uniform vec4 iMouse;
// Sampler for input textures i
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform sampler2D iChannel4;
uniform sampler2D iChannel5;
uniform sampler2D iChannel6;

uniform vec4 iDate; // Year, month, day, time in seconds in .xyzw
uniform float iSampleRate; // The sound sample rate (typically 44100)

${v}

varying vec2 vUv;
void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
}
`

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const fragmentShader = shaderToyToThreeShader(examples[0].fragment)

window.vue = new window.Vue({
  el: '#app',

  data: vm => ({
    items: examples,
    form: {
      uniforms: {},
      fragmentShader
    }
  }),

  mounted () {
    const viewer = createViewer({
      el: 'webgl',
      cameraDistance: 10
    })
    const { scene } = viewer

    scene.add(new THREE.AxesHelper(1000))

    const loadTexture = (url = '') => {
      const loader = new THREE.TextureLoader()
      const texture = loader.load(url)
      texture.minFilter = THREE.NearestFilter
      texture.magFilter = THREE.NearestFilter
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      return texture
    }

    // https://dev.to/maniflames/creating-a-custom-shader-in-threejs-3bhi
    const uniforms = {
      iTime: { value: 0 },
      iFrame: { type: 'int', value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      iChannel0: { type: 'sampler2D', value: loadTexture('0.jpg') },
      iChannel1: { type: 'sampler2D', value: loadTexture('1.jpg') }
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material)
    scene.add(mesh)

    function render (time = 0) {
      time *= 0.001 // convert to seconds

      uniforms.iTime.value = time
      // uniforms.iFrame.value = uniforms.iFrame.value + 1

      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)

    // Vue
    this.form.uniforms = uniforms
    this.$watch('form.uniforms', v => {
      // material.fragmentShader = v
      // material.uniforms = v
      material.uniforms.colorA.value = new THREE.Color('blue')
      console.log('[new uniforms]', mesh)
    })

    this.$watch('form.fragmentShader', (fragment = '') => {
      console.log('[new shader]')
      // console.log(shaderToyToThreeShader(fragment))

      mesh.material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader: shaderToyToThreeShader(fragment),
        side: THREE.DoubleSide
      })
    })
  },
  vuetify: new window.Vuetify()
})

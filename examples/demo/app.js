import Earth from '/js/earth.js'
import VueAceEdit from './vue-ace-edit.js'

// import httpVueLoader from './httpVueLoader.js'
// Vue.component('AceEditor', httpVueLoader('./vue-ace-edit/src/AceEditor.vue'))

const vue = new Vue({
  el: '#app',
  data: vm => ({
    form: {

    }
  }),
  mounted () {
    const earth = new Earth({
      radius: 1 // 6371
    })

    const { scene, settings, THREE } = earth
    this.form = settings

    // Expose
    window.scene = scene
    window.THREE = THREE

    this.$watch('form', value => {
      // earth.settings = value
      Object.assign(earth.settings, value)
    })
  },
  vuetify: new Vuetify()
})

import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'

Vue.prototype.$backendAddr = '192.168.2.31';

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')

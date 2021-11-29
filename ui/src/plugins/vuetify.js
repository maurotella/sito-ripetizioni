import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

const vuetify = new Vuetify({
    theme: {
      themes: {
        light: {
          primary: '#f08800'
     },
   },
 },
})

Vue.use(Vuetify);

export default vuetify;

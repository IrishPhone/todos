// import Vue from 'vue';
// import App from './App.vue';
// import router from './router';

// Vue.config.productionTip = false;

// new Vue({
//   router,
//   render: h => h(App),
// }).$mount('#app');
// import 'bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App.vue';
import router from './router';

Vue.use(BootstrapVue);
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');

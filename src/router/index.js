import Vue from 'vue';
import VueRouter from 'vue-router';
import Todo from '../components/Todos.vue';
​
Vue.use(VueRouter);
​
export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'todos',
      component: Todos,
    },
  ],
});
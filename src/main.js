import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import Graph from './components/GraphDrawing.vue'
import Dijkstra from './components/Dijkstra.vue'
import OsTree from './components/OsTree.vue'

import VueFire from 'vuefire'
import Firebase from 'firebase'
import toastr from 'toastr'

Vue.component('breadth-first', Graph);
Vue.component('dijkstra-algo', Dijkstra);
Vue.component('ostree', OsTree);

Vue.use(VueFire)
Vue.use(VueRouter)

var router = new VueRouter({
  routes: [
    { path: '/dijkstra', component: Dijkstra },
    { path: '/search', component: Graph },
    { path: '/buildtree', component: OsTree }
  ]
}) 

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
})

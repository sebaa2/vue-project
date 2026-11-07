// routes.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Details from '../pages/Details.vue'
import Competitive from '../pages/Competitive.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/details/:id',
    name: 'details',
    component: Details,
  },
  {
    path: '/competitive',
    name: 'competitive',
    component: Competitive,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

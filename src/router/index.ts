import { createRouter,/*createWebHistory,*/createWebHashHistory } from "vue-router";
import { getUserData } from '@/api/storge'

const routes = [
  { path: '/', redirect: '/main'},
  {
    path: '/home', name: 'Home', component: () => import('@/view/home.vue'),
    children: [
      { path: '/main', name: 'Main', component: () => import('@/view/main.vue') },
      { path: '/code', name: 'Code', component: () => import('@/view/qrcode.vue') },
      { path: '/me', name: 'me', component: () => import('@/view/me.vue') },
        ]
  },
  { path: '/dubao/:dubaoId', name: 'Dubao', component: () => import('@/view/dubao.vue') },
  { path: '/login', name: 'login', component: () => import('@/view/login.vue') },
]
const router = createRouter(
  {
    // history: createWebHistory(),
    history: createWebHashHistory(),
    routes: routes
  }
)




router.beforeEach((to) => {
  const token = getUserData();
  if (!token && to.path !== '/login') {
    return {
      path: '/login'
    }
  }

  return true
})
export default router;

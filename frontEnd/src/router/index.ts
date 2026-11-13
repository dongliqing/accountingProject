import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/',
    name: 'Transactions',
    component: () => import('@/views/Transactions.vue'),
    meta: { title: '明细', requiresAuth: true },
  },
  {
    path: '/bills',
    name: 'Bills',
    component: () => import('@/views/Bills.vue'),
    meta: { title: '账单', requiresAuth: true },
  },
  {
    path: '/add',
    name: 'AddBill',
    component: () => import('@/views/AddBill.vue'),
    meta: { title: '记一笔', requiresAuth: true, tabbar: false, fullscreen: true },
  },
  {
    path: '/me',
    name: 'Me',
    component: () => import('@/views/Me.vue'),
    meta: { title: '我的', requiresAuth: true },
  },
]

const APP_NAME = '多账单记账助手'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ──────────────────────────────────────────────
// 全局路由守卫 — 登录鉴权 + 标题设置
// ──────────────────────────────────────────────
router.beforeEach((to) => {
  // 动态设置页面标题
  const title = (to.meta.title as string) || APP_NAME
  document.title = title === APP_NAME ? APP_NAME : `${title} - ${APP_NAME}`

  // 登录鉴权
  const requiresAuth = to.meta.requiresAuth !== false // 默认需要登录
  const token = localStorage.getItem('token')

  if (requiresAuth && !token) {
    // 未登录，跳转到登录页
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // 已登录状态访问登录页，直接跳转首页
  if (to.name === 'Login' && token) {
    return { name: 'Transactions' }
  }
})

export default router

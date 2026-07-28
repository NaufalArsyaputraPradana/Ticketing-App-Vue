import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue') // Or pages/public/Home.vue if moved
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: () => import('../views/EventDetailView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/dashboard/user',
      name: 'user-dashboard',
      component: () => import('../pages/user/Dashboard.vue'),
      meta: { requiresAuth: true, layout: 'DashboardLayout' }
    },
    {
      path: '/dashboard/organizer',
      name: 'organizer-dashboard',
      component: () => import('../pages/organizer/Dashboard.vue'),
      meta: { requiresAuth: true, requiresOrganizer: true, layout: 'DashboardLayout' }
    },
    {
      path: '/dashboard/admin',
      name: 'admin-dashboard',
      component: () => import('../pages/admin/Dashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'DashboardLayout' }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/FavoritesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true, layout: 'DashboardLayout' }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
      meta: { guestOnly: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else if (to.meta.requiresOrganizer && !authStore.isOrganizer) {
    next('/')
  } else {
    next()
  }
})

export default router

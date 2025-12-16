import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/auth/Login.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/Register.vue')
    },
    // Student routes
    {
      path: '/student',
      component: () => import('../layouts/StudentLayout.vue'),
      meta: { requiresAuth: true, role: 'student' },
      children: [
        {
          path: 'dashboard',
          name: 'student-dashboard',
          component: () => import('../views/student/Dashboard.vue')
        },
        {
          path: 'request-project',
          name: 'student-request-project',
          component: () => import('../views/student/RequestProject.vue')
        },
        {
          path: 'propose-topic',
          name: 'student-propose-topic',
          component: () => import('../views/student/ProposeTopic.vue')
        },
        {
          path: 'submit-report',
          name: 'student-submit-report',
          component: () => import('../views/student/SubmitReport.vue')
        },
        {
          path: 'final-status',
          name: 'student-final-status',
          component: () => import('../views/student/FinalStatus.vue')
        },
        {
          path: 'messages',
          name: 'student-messages',
          component: () => import('../views/common/Messages.vue')
        }
      ]
    },
    // Professor routes
    {
      path: '/professor',
      component: () => import('../layouts/ProfessorLayout.vue'),
      meta: { requiresAuth: true, role: 'professor' },
      children: [
        {
          path: 'dashboard',
          name: 'professor-dashboard',
          component: () => import('../views/professor/Dashboard.vue')
        },
        {
          path: 'projects',
          name: 'professor-projects',
          component: () => import('../views/professor/Projects.vue')
        },
        {
          path: 'topics',
          name: 'professor-topics',
          component: () => import('../views/professor/TopicsManagement.vue')
        },
        {
          path: 'defense-times',
          name: 'professor-defense-times',
          component: () => import('../views/professor/DefenseTimes.vue')
        },
        {
          path: 'grading',
          name: 'professor-grading',
          component: () => import('../views/professor/Grading.vue')
        },
        {
          path: 'messages',
          name: 'professor-messages',
          component: () => import('../views/common/Messages.vue')
        }
      ]
    },
    // Head of Department routes
    {
      path: '/head',
      component: () => import('../layouts/HeadLayout.vue'),
      meta: { requiresAuth: true, role: 'head_of_department' },
      children: [
        {
          path: 'dashboard',
          name: 'head-dashboard',
          component: () => import('../views/head/Dashboard.vue')
        },
        {
          path: 'term-management',
          name: 'head-term-management',
          component: () => import('../views/head/TermManagement.vue')
        },
        {
          path: 'capacity',
          name: 'head-capacity',
          component: () => import('../views/head/Capacity.vue')
        },
        {
          path: 'projects',
          name: 'head-projects',
          component: () => import('../views/head/Projects.vue')
        },
        {
          path: 'assignment',
          name: 'head-assignment',
          component: () => import('../views/head/Assignment.vue')
        },
        {
          path: 'scheduling',
          name: 'head-scheduling',
          component: () => import('../views/head/DefenseScheduling.vue')
        },
        {
          path: 'messages',
          name: 'head-messages',
          component: () => import('../views/common/Messages.vue')
        }
      ]
    },
    // Admin routes
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/Users.vue')
        },
        {
          path: 'logs',
          name: 'admin-logs',
          component: () => import('../views/admin/AuditLogs.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/common/NotFound.vue')
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login')
    } else if (to.meta.role && authStore.userRole !== to.meta.role) {
      next(`/${authStore.userRole}/dashboard`)
    } else {
      next()
    }
  } else {
    if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/')) {
      next(`/${authStore.userRole}/dashboard`)
    } else {
      next()
    }
  }
})

export default router

#!/bin/bash

# Frontend Production Setup Script
# This script creates all necessary files for the Vue.js frontend

cd "$(dirname "$0")"

echo "🚀 Setting up Production Frontend..."

# Create all required files with content

echo "Creating stores..."
cat > src/stores/auth.js << 'STOREFILE'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      if (response.data.success) {
        token.value = response.data.token
        user.value = response.data.user
        api.setAuthToken(response.data.token)
        return true
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'خطا در ورود'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data.success) {
        return { success: true, message: response.data.message }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'خطا در ثبت‌نام'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const response = await api.get('/auth/profile')
      if (response.data.success) {
        user.value = response.data.user
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    api.setAuthToken(null)
    router.push('/login')
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    login,
    register,
    fetchProfile,
    logout
  }
}, {
  persist: {
    paths: ['token', 'user']
  }
})
STOREFILE

echo "Creating API service..."
cat > src/services/api.js << 'APIFILE'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.token) {
          config.headers.Authorization = `Bearer ${authData.token}`
        }
      } catch (e) {
        console.error('Error parsing auth token:', e)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Helper function to set auth token
api.setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export default api
APIFILE

echo "Creating router..."
cat > src/router/index.js << 'ROUTERFILE'
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
          component: () => import('../views/head/CapacityManagement.vue')
        },
        {
          path: 'projects',
          name: 'head-projects',
          component: () => import('../views/head/ProjectsManagement.vue')
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
          component: () => import('../views/admin/UsersManagement.vue')
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
ROUTERFILE

echo "✅ Frontend structure created successfully!"
echo ""
echo "📦 Next steps:"
echo "1. Review generated files in src/"
echo "2. Install dependencies: npm install"
echo "3. Start dev server: npm run dev"
echo "4. Access at: http://localhost:5173"
STOREFILE

chmod +x setup-frontend.sh

echo "✅ Setup script created: setup-frontend.sh"

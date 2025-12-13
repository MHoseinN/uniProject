import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Register from '../views/Register.vue'
import Login from '../views/Login.vue'
import StudentDashboard from '../views/student/Dashboard.vue'
import ProfessorDashboard from '../views/professor/Dashboard.vue'
import ManagerDashboard from '../views/manager/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/professor/dashboard',
    name: 'ProfessorDashboard',
    component: ProfessorDashboard,
    meta: { requiresAuth: true, role: 'professor' }
  },
  {
    path: '/manager/dashboard',
    name: 'ManagerDashboard',
    component: ManagerDashboard,
    meta: { requiresAuth: true, role: 'manager' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  if (to.meta.requiresAuth) {
    if (!user) {
      next('/login')
    } else if (to.meta.role && user.role !== to.meta.role) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

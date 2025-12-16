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

import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userRole: (state) => state.user?.role || null
  },

  actions: {
    async register(role, userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_URL}/register/${role}`, userData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ثبت نام'
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(role, credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_URL}/login/${role}`, credentials)
        
        if (response.data.success) {
          this.user = response.data.user || { role }
          localStorage.setItem('user', JSON.stringify(this.user))
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ورود'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      localStorage.removeItem('user')
      axios.get(`${API_URL}/logout`)
    }
  }
})

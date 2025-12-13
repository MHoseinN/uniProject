import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// تنظیم axios برای ارسال cookies
axios.defaults.withCredentials = true
axios.defaults.baseURL = API_URL

// Interceptor برای مدیریت خطاها
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axios

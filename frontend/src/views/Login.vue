<template>
  <div class="login-page">
    <div class="login-container">
      <h2>ورود به سیستم</h2>
      
      <div v-if="message.text" :class="['alert', message.type]">
        {{ message.text }}
      </div>
      
      <div class="role-selector">
        <button 
          :class="['role-btn', { active: selectedRole === 'student' }]"
          @click="selectedRole = 'student'"
        >
          دانشجو
        </button>
        <button 
          :class="['role-btn', { active: selectedRole === 'professor' }]"
          @click="selectedRole = 'professor'"
        >
          استاد
        </button>
        <button 
          :class="['role-btn', { active: selectedRole === 'manager' }]"
          @click="selectedRole = 'manager'"
        >
          مدیر گروه
        </button>
      </div>
      
      <div class="info-box">
        نام کاربری: کد ملی | رمز عبور: 
        {{ selectedRole === 'student' ? 'شماره دانشجویی' : 
           selectedRole === 'professor' ? 'شماره شناسایی استادی' : 
           'شماره شناسایی مدیرگروه' }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>کد ملی</label>
          <input v-model="credentials.nationalCode" type="text" pattern="[0-9]{10}" required>
        </div>
        
        <div class="form-group">
          <label>
            {{ selectedRole === 'student' ? 'شماره دانشجویی' : 
               selectedRole === 'professor' ? 'شماره شناسایی استادی' : 
               'شماره شناسایی مدیرگروه' }}
          </label>
          <input v-model="credentials.password" type="text" required>
        </div>
        
        <button type="submit" class="btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'در حال ورود...' : 'ورود' }}
        </button>
      </form>
      
      <div class="link">
        حساب کاربری ندارید؟ <router-link to="/register">ثبت نام</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const selectedRole = ref('student')
const credentials = ref({
  nationalCode: '',
  password: ''
})

const message = ref({ text: '', type: '' })

const handleSubmit = async () => {
  message.value = { text: '', type: '' }
  
  const loginData = {
    nationalCode: credentials.value.nationalCode
  }
  
  if (selectedRole.value === 'student') {
    loginData.studentNumber = credentials.value.password
  } else if (selectedRole.value === 'professor') {
    loginData.professorId = credentials.value.password
  } else {
    loginData.managerId = credentials.value.password
  }
  
  try {
    const result = await authStore.login(selectedRole.value, loginData)
    
    if (result.success) {
      message.value = { text: 'ورود موفقیت‌آمیز بود...', type: 'success' }
      setTimeout(() => {
        router.push(`/${selectedRole.value}/dashboard`)
      }, 1000)
    }
  } catch (error) {
    message.value = { 
      text: error.response?.data?.message || 'خطا در ورود', 
      type: 'error' 
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-width: 450px;
  width: 100%;
}

h2 {
  color: #667eea;
  text-align: center;
  margin-bottom: 30px;
}

.role-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.role-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
}

.role-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.info-box {
  background: #e7f3ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #004085;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  margin-top: 10px;
}

.btn:hover:not(:disabled) {
  background: #764ba2;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.link a {
  color: #667eea;
  text-decoration: none;
}

.alert {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert.success {
  background: #d4edda;
  color: #155724;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
}
</style>

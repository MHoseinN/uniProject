<template>
  <div class="register-page">
    <div class="register-container">
      <h2>ثبت نام</h2>
      
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
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>نام *</label>
          <input v-model="form.firstName" type="text" required>
        </div>
        
        <div class="form-group">
          <label>نام خانوادگی *</label>
          <input v-model="form.lastName" type="text" required>
        </div>
        
        <div v-if="selectedRole === 'student'" class="form-group">
          <label>شماره دانشجویی *</label>
          <input v-model="form.studentNumber" type="text" required>
        </div>
        
        <div v-if="selectedRole === 'professor'" class="form-group">
          <label>شماره شناسایی استادی *</label>
          <input v-model="form.professorId" type="text" required>
        </div>
        
        <div v-if="selectedRole === 'manager'" class="form-group">
          <label>شماره شناسایی مدیرگروه *</label>
          <input v-model="form.managerId" type="text" required>
        </div>
        
        <div class="form-group">
          <label>کد ملی * (10 رقم)</label>
          <input v-model="form.nationalCode" type="text" pattern="[0-9]{10}" required>
        </div>
        
        <div class="form-group">
          <label>رشته تحصیلی *</label>
          <input v-model="form.major" type="text" required>
        </div>
        
        <button type="submit" class="btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'در حال ثبت...' : 'ثبت نام' }}
        </button>
      </form>
      
      <div class="link">
        قبلا ثبت نام کرده‌اید؟ <router-link to="/login">ورود</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const selectedRole = ref('student')
const form = ref({
  firstName: '',
  lastName: '',
  studentNumber: '',
  professorId: '',
  managerId: '',
  nationalCode: '',
  major: ''
})

const message = ref({ text: '', type: '' })

watch(selectedRole, () => {
  form.value = {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    nationalCode: form.value.nationalCode,
    major: form.value.major,
    studentNumber: '',
    professorId: '',
    managerId: ''
  }
})

const handleSubmit = async () => {
  message.value = { text: '', type: '' }
  
  try {
    const result = await authStore.register(selectedRole.value, form.value)
    
    if (result.success) {
      message.value = { text: result.message, type: 'success' }
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (error) {
    message.value = { 
      text: error.response?.data?.message || 'خطا در ثبت نام', 
      type: 'error' 
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-container {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-width: 500px;
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

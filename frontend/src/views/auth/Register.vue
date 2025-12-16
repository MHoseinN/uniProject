<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark py-8">
    <div class="card w-full max-w-2xl">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">ثبت‌نام در سیستم</h1>
        <p class="text-gray-600">لطفاً اطلاعات خود را وارد کنید</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">نقش</label>
          <select v-model="form.role" class="input-field" required>
            <option value="">انتخاب کنید</option>
            <option value="student">دانشجو</option>
            <option value="professor">استاد</option>
            <option value="head_of_department">مدیر گروه</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">نام</label>
            <input v-model="form.firstName" type="text" class="input-field" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">نام خانوادگی</label>
            <input v-model="form.lastName" type="text" class="input-field" required />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">ایمیل</label>
          <input v-model="form.email" type="email" class="input-field" required />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">رمز عبور (حداقل ۶ کاراکتر)</label>
          <input v-model="form.password" type="password" class="input-field" required minlength="6" />
        </div>

        <div v-if="form.role === 'student'" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">شماره دانشجویی</label>
            <input v-model="form.studentNumber" type="text" class="input-field" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">رشته</label>
            <select v-model="form.major" class="input-field" required>
              <option value="">انتخاب کنید</option>
              <option value="کامپیوتر">کامپیوتر</option>
              <option value="برق">برق</option>
              <option value="مکانیک">مکانیک</option>
              <option value="عمران">عمران</option>
              <option value="شیمی">شیمی</option>
            </select>
          </div>
        </div>

        <div v-if="form.role === 'professor' || form.role === 'head_of_department'">
          <label class="block text-sm font-medium mb-2">شماره استاد</label>
          <input v-model="form.professorId" type="text" class="input-field" required />
        </div>

        <div v-if="successMessage" class="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
          {{ successMessage }}
        </div>

        <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary w-full" :disabled="loading">
          <span v-if="loading">در حال ثبت‌نام...</span>
          <span v-else>ثبت‌نام</span>
        </button>

        <div class="text-center">
          <router-link to="/login" class="text-primary hover:underline text-sm">
            قبلاً ثبت‌نام کرده‌اید؟ ورود
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const form = ref({
  role: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  studentNumber: '',
  professorId: '',
  major: ''
})

const loading = ref(false)
const error = ref(null)
const successMessage = ref(null)

watch(() => form.value.role, () => {
  form.value.studentNumber = ''
  form.value.professorId = ''
  form.value.major = ''
})

async function handleRegister() {
  loading.value = true
  error.value = null
  successMessage.value = null
  
  const result = await authStore.register(form.value)
  
  if (result.success) {
    successMessage.value = result.message
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  } else {
    error.value = result.message
  }
  
  loading.value = false
}
</script>

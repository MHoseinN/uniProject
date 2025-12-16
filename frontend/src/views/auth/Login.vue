<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
    <div class="card w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">سامانه مدیریت پروژه</h1>
        <p class="text-gray-600">ورود به سیستم</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">ایمیل</label>
          <input
            v-model="form.email"
            type="email"
            class="input-field"
            placeholder="example@university.edu"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">رمز عبور</label>
          <input
            v-model="form.password"
            type="password"
            class="input-field"
            placeholder="********"
            required
          />
        </div>

        <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary w-full" :disabled="loading">
          <span v-if="loading">در حال ورود...</span>
          <span v-else>ورود</span>
        </button>

        <div class="text-center">
          <router-link to="/register" class="text-primary hover:underline text-sm">
            ثبت‌نام نکرده‌اید؟
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)

async function handleLogin() {
  loading.value = true
  error.value = null
  
  const success = await authStore.login(form.value)
  
  if (success) {
    const role = authStore.userRole
    router.push(`/${role}/dashboard`)
  } else {
    error.value = authStore.error
  }
  
  loading.value = false
}
</script>

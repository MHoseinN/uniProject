<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">درخواست اخذ پروژه</h2>

    <div class="card max-w-2xl">
      <div v-if="success" class="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
        {{ success }}
      </div>

      <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        {{ error }}
      </div>

      <div class="space-y-4">
        <p class="text-gray-700">
          با کلیک بر روی دکمه زیر، درخواست اخذ پروژه برای ترم فعال ثبت می‌شود.
        </p>

        <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p class="text-sm text-yellow-800">
            ⚠️ توجه: هر دانشجو فقط می‌تواند یک پروژه فعال در هر ترم داشته باشد.
          </p>
        </div>

        <button
          @click="submitRequest"
          class="btn-primary w-full"
          :disabled="loading"
        >
          <span v-if="loading">در حال ارسال درخواست...</span>
          <span v-else>ثبت درخواست اخذ پروژه</span>
        </button>

        <div class="text-center">
          <router-link to="/student/dashboard" class="text-primary hover:underline text-sm">
            بازگشت به داشبورد
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()
const loading = ref(false)
const error = ref(null)
const success = ref(null)

async function submitRequest() {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const response = await api.post('/student/request-project')
    if (response.data.success) {
      success.value = response.data.message
      setTimeout(() => {
        router.push('/student/dashboard')
      }, 2000)
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'خطا در ارسال درخواست'
  } finally {
    loading.value = false
  }
}
</script>

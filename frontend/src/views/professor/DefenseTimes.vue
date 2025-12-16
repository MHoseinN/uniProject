<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">ارسال زمان‌های دفاع</h2>

    <div class="card max-w-3xl">
      <p class="text-gray-700 mb-6">
        لطفاً حداقل سه بازه زمانی برای دفاع پروژه‌ها پیشنهاد دهید. مدیر گروه یکی از این زمان‌ها را انتخاب خواهد کرد.
      </p>

      <form @submit.prevent="submitDefenseTimes" class="space-y-6">
        <div v-for="(time, index) in defenseTimes" :key="index" class="card bg-gray-50 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-bold">بازه زمانی {{ index + 1 }}</h3>
            <button
              v-if="defenseTimes.length > 3"
              @click="removeTime(index)"
              type="button"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              حذف
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">تاریخ</label>
              <input
                v-model="time.date"
                type="date"
                class="input-field"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">ساعت شروع</label>
              <input
                v-model="time.startTime"
                type="time"
                class="input-field"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="addTime"
          class="btn-outline w-full"
        >
          + افزودن بازه زمانی جدید
        </button>

        <div v-if="success" class="bg-green-100 text-green-700 p-4 rounded-lg">
          {{ success }}
        </div>

        <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg">
          {{ error }}
        </div>

        <div class="flex gap-4">
          <button type="submit" class="btn-primary flex-1" :disabled="loading">
            <span v-if="loading">در حال ارسال...</span>
            <span v-else>ثبت زمان‌های دفاع</span>
          </button>
          <router-link to="/professor/dashboard" class="btn-outline flex-1 text-center">
            انصراف
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../../services/api'

const defenseTimes = ref([
  { date: '', startTime: '' },
  { date: '', startTime: '' },
  { date: '', startTime: '' }
])

const loading = ref(false)
const error = ref(null)
const success = ref(null)

function addTime() {
  defenseTimes.value.push({ date: '', startTime: '' })
}

function removeTime(index) {
  defenseTimes.value.splice(index, 1)
}

async function submitDefenseTimes() {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const response = await api.post('/professor/submit-defense-times', {
      defenseTimes: defenseTimes.value
    })
    if (response.data.success) {
      success.value = response.data.message
      defenseTimes.value = [
        { date: '', startTime: '' },
        { date: '', startTime: '' },
        { date: '', startTime: '' }
      ]
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'خطا در ارسال زمان‌ها'
  } finally {
    loading.value = false
  }
}
</script>

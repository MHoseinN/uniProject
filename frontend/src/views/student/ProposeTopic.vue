<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">پیشنهاد موضوع پروژه</h2>

    <div class="card max-w-2xl">
      <form @submit.prevent="submitTopic" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">موضوع پیشنهادی</label>
          <textarea
            v-model="topic"
            class="input-field min-h-[120px]"
            placeholder="موضوع پروژه خود را با جزئیات کامل بنویسید..."
            required
          ></textarea>
          <p class="text-sm text-gray-500 mt-1">
            حداقل 20 کاراکتر
          </p>
        </div>

        <div v-if="success" class="bg-green-100 text-green-700 p-4 rounded-lg">
          {{ success }}
        </div>

        <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg">
          {{ error }}
        </div>

        <div class="flex gap-4">
          <button type="submit" class="btn-primary flex-1" :disabled="loading">
            <span v-if="loading">در حال ارسال...</span>
            <span v-else>ثبت موضوع</span>
          </button>
          <router-link to="/student/dashboard" class="btn-outline flex-1 text-center">
            انصراف
          </router-link>
        </div>
      </form>

      <div v-if="previousTopics.length > 0" class="mt-8 pt-8 border-t">
        <h3 class="font-bold mb-4">موضوعات پیشنهادی قبلی</h3>
        <div class="space-y-3">
          <div
            v-for="(item, index) in previousTopics"
            :key="index"
            class="p-4 bg-gray-50 rounded-lg"
          >
            <p class="text-sm text-gray-700">{{ item.topic }}</p>
            <p class="text-xs text-gray-500 mt-2">
              {{ toPersianDate(item.proposedAt) }}
              <span
                v-if="item.status === 'approved'"
                class="badge-success mr-2"
              >
                تأیید شده
              </span>
              <span
                v-else-if="item.status === 'rejected'"
                class="badge-danger mr-2"
              >
                رد شده
              </span>
              <span v-else class="badge-warning mr-2">در انتظار بررسی</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { toPersianDate } from '../../utils/date'

const topic = ref('')
const loading = ref(false)
const error = ref(null)
const success = ref(null)
const previousTopics = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/student/dashboard')
    if (response.data.project?.proposedTopics) {
      previousTopics.value = response.data.project.proposedTopics
    }
  } catch (err) {
    console.error('خطا در دریافت موضوعات:', err)
  }
})

async function submitTopic() {
  if (topic.value.length < 20) {
    error.value = 'موضوع باید حداقل 20 کاراکتر باشد'
    return
  }

  loading.value = true
  error.value = null
  success.value = null

  try {
    const response = await api.post('/student/propose-topic', {
      topic: topic.value
    })
    if (response.data.success) {
      success.value = response.data.message
      topic.value = ''
      if (response.data.project?.proposedTopics) {
        previousTopics.value = response.data.project.proposedTopics
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'خطا در ثبت موضوع'
  } finally {
    loading.value = false
  }
}
</script>

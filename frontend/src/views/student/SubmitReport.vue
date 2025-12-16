<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">ارسال گزارش پیشرفت</h2>

    <div class="card max-w-2xl">
      <form @submit.prevent="submitReport" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">متن گزارش</label>
          <textarea
            v-model="form.content"
            class="input-field min-h-[200px]"
            placeholder="گزارش پیشرفت کار خود را بنویسید..."
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">فایل گزارش (اختیاری)</label>
          <input
            type="file"
            @change="handleFileChange"
            accept=".pdf,.doc,.docx"
            class="input-field"
          />
          <p class="text-sm text-gray-500 mt-1">
            فرمت‌های مجاز: PDF, DOC, DOCX - حداکثر 20 مگابایت
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
            <span v-else>ارسال گزارش</span>
          </button>
          <router-link to="/student/dashboard" class="btn-outline flex-1 text-center">
            انصراف
          </router-link>
        </div>
      </form>

      <div v-if="reports.length > 0" class="mt-8 pt-8 border-t">
        <h3 class="font-bold mb-4">گزارش‌های قبلی</h3>
        <div class="space-y-3">
          <div
            v-for="(report, index) in reports"
            :key="index"
            class="p-4 bg-gray-50 rounded-lg"
          >
            <p class="text-sm text-gray-700" v-if="report.content">
              {{ report.content.substring(0, 100) }}...
            </p>
            <div class="flex items-center justify-between mt-2">
              <p class="text-xs text-gray-500">
                {{ toPersianDateTime(report.submittedAt) }}
              </p>
              <a
                v-if="report.fileUrl"
                :href="`http://localhost:3000${report.fileUrl}`"
                target="_blank"
                class="text-xs text-primary hover:underline"
              >
                دانلود فایل
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { toPersianDateTime } from '../../utils/date'

const form = ref({
  content: '',
  file: null
})

const loading = ref(false)
const error = ref(null)
const success = ref(null)
const reports = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/student/dashboard')
    if (response.data.project?.reports) {
      reports.value = response.data.project.reports
    }
  } catch (err) {
    console.error('خطا در دریافت گزارش‌ها:', err)
  }
})

function handleFileChange(event) {
  form.value.file = event.target.files[0]
}

async function submitReport() {
  if (!form.value.content && !form.value.file) {
    error.value = 'لطفاً متن گزارش یا فایل را ارسال کنید'
    return
  }

  loading.value = true
  error.value = null
  success.value = null

  try {
    const formData = new FormData()
    if (form.value.content) {
      formData.append('content', form.value.content)
    }
    if (form.value.file) {
      formData.append('file', form.value.file)
    }

    const response = await api.post('/student/submit-report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.data.success) {
      success.value = response.data.message
      form.value.content = ''
      form.value.file = null
      reports.value.unshift(response.data.report)
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'خطا در ارسال گزارش'
  } finally {
    loading.value = false
  }
}
</script>

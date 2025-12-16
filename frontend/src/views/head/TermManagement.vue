<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">مدیریت ترم</h2>

    <!-- Create New Term -->
    <div class="card mb-6 max-w-2xl">
      <h3 class="text-lg font-bold mb-4">ایجاد ترم جدید</h3>
      <form @submit.prevent="createTerm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">نام ترم</label>
          <input
            v-model="newTerm.name"
            type="text"
            class="input-field"
            placeholder="مثال: ترم بهار 1403"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">تاریخ شروع</label>
            <input
              v-model="newTerm.startDate"
              type="date"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">تاریخ پایان</label>
            <input
              v-model="newTerm.endDate"
              type="date"
              class="input-field"
              required
            />
          </div>
        </div>

        <div v-if="createSuccess" class="bg-green-100 text-green-700 p-3 rounded-lg">
          {{ createSuccess }}
        </div>

        <div v-if="createError" class="bg-red-100 text-red-700 p-3 rounded-lg">
          {{ createError }}
        </div>

        <button type="submit" class="btn-primary" :disabled="creating">
          <span v-if="creating">در حال ایجاد...</span>
          <span v-else>ایجاد ترم</span>
        </button>
      </form>
    </div>

    <!-- Terms List -->
    <div class="card">
      <h3 class="text-lg font-bold mb-4">لیست ترم‌ها</h3>
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="term in terms"
          :key="term._id"
          class="p-4 border rounded-lg"
          :class="{ 'border-primary bg-primary bg-opacity-5': term.isActive }"
        >
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-bold">{{ term.name }}</h4>
              <p class="text-sm text-gray-600 mt-1">
                {{ toPersianDate(term.startDate) }} تا {{ toPersianDate(term.endDate) }}
              </p>
              <span :class="term.isActive ? 'badge-success' : 'badge-secondary'">
                {{ term.isActive ? 'فعال' : 'غیرفعال' }}
              </span>
            </div>
            <button
              v-if="!term.isActive"
              @click="activateTerm(term._id)"
              class="btn-primary text-sm px-4 py-1"
            >
              فعال‌سازی
            </button>
            <button
              v-else
              @click="deactivateTerm(term._id)"
              class="btn-outline text-sm px-4 py-1"
            >
              غیرفعال‌سازی
            </button>
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

const newTerm = ref({
  name: '',
  startDate: '',
  endDate: ''
})

const terms = ref([])
const loading = ref(true)
const creating = ref(false)
const createSuccess = ref(null)
const createError = ref(null)

onMounted(async () => {
  await fetchTerms()
})

async function fetchTerms() {
  try {
    const response = await api.get('/head/terms')
    if (response.data.success) {
      terms.value = response.data.terms
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
}

async function createTerm() {
  creating.value = true
  createSuccess.value = null
  createError.value = null

  try {
    const response = await api.post('/head/term/create', newTerm.value)
    if (response.data.success) {
      createSuccess.value = response.data.message
      newTerm.value = { name: '', startDate: '', endDate: '' }
      await fetchTerms()
    }
  } catch (err) {
    createError.value = err.response?.data?.message || 'خطا در ایجاد ترم'
  } finally {
    creating.value = false
  }
}

async function activateTerm(termId) {
  try {
    const response = await api.post(`/head/term/${termId}/activate`)
    if (response.data.success) {
      await fetchTerms()
    }
  } catch (error) {
    alert(error.response?.data?.message || 'خطا در فعال‌سازی ترم')
  }
}

async function deactivateTerm(termId) {
  try {
    const response = await api.post(`/head/term/${termId}/deactivate`)
    if (response.data.success) {
      await fetchTerms()
    }
  } catch (error) {
    alert(error.response?.data?.message || 'خطا در غیرفعال‌سازی ترم')
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">نمره‌دهی پروژه‌ها</h2>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="project in gradableProjects"
        :key="project._id"
        class="card"
      >
        <div class="mb-4">
          <h3 class="font-bold text-lg">{{ project.projectCode }}</h3>
          <p class="text-sm text-gray-600">
            دانشجو: {{ project.student?.firstName }} {{ project.student?.lastName }}
          </p>
          <p class="text-sm text-gray-600" v-if="project.topic">
            موضوع: {{ project.topic }}
          </p>
        </div>

        <form @submit.prevent="submitGrade(project._id)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">نمره (0 تا 20)</label>
            <input
              v-model.number="grades[project._id]"
              type="number"
              min="0"
              max="20"
              step="0.25"
              class="input-field"
              placeholder="مثال: 17.5"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">توضیحات (اختیاری)</label>
            <textarea
              v-model="comments[project._id]"
              class="input-field min-h-[100px]"
              placeholder="توضیحات در مورد نمره..."
            ></textarea>
          </div>

          <button
            type="submit"
            class="btn-primary"
            :disabled="submitting[project._id]"
          >
            <span v-if="submitting[project._id]">در حال ثبت...</span>
            <span v-else>ثبت نمره</span>
          </button>

          <div v-if="success[project._id]" class="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
            {{ success[project._id] }}
          </div>

          <div v-if="errors[project._id]" class="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {{ errors[project._id] }}
          </div>
        </form>
      </div>

      <div v-if="gradableProjects.length === 0" class="card text-center py-8">
        <p class="text-gray-500">پروژه‌ای برای نمره‌دهی وجود ندارد</p>
        <p class="text-sm text-gray-400 mt-2">
          فقط پروژه‌هایی که دفاع آنها انجام شده قابل نمره‌دهی هستند
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '../../services/api'

const projects = ref([])
const loading = ref(true)
const grades = reactive({})
const comments = reactive({})
const submitting = reactive({})
const success = reactive({})
const errors = reactive({})

const gradableProjects = computed(() => {
  return projects.value.filter(p => p.status === 'defense_completed')
})

onMounted(async () => {
  try {
    const response = await api.get('/professor/projects')
    if (response.data.success) {
      projects.value = response.data.projects
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
})

async function submitGrade(projectId) {
  if (!grades[projectId] || grades[projectId] < 0 || grades[projectId] > 20) {
    errors[projectId] = 'نمره باید بین 0 تا 20 باشد'
    return
  }

  submitting[projectId] = true
  errors[projectId] = null
  success[projectId] = null

  try {
    const response = await api.post('/professor/submit-grade', {
      projectId,
      grade: grades[projectId],
      comments: comments[projectId]
    })
    if (response.data.success) {
      success[projectId] = response.data.message
      // Remove project from list after grading
      projects.value = projects.value.filter(p => p._id !== projectId)
    }
  } catch (err) {
    errors[projectId] = err.response?.data?.message || 'خطا در ثبت نمره'
  } finally {
    submitting[projectId] = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">پروژه‌ها</h2>

    <div class="card mb-6">
      <div class="flex gap-4 items-center">
        <select v-model="filter" class="input-field flex-1">
          <option value="all">همه پروژه‌ها</option>
          <option value="supervising">راهنمایی</option>
          <option value="examining">داوری</option>
        </select>
        <input
          v-model="search"
          type="text"
          class="input-field flex-1"
          placeholder="جستجو در کد پروژه یا نام دانشجو..."
        />
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="project in filteredProjects"
        :key="project._id"
        class="card hover:shadow-lg transition cursor-pointer"
        @click="viewProject(project._id)"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-lg">{{ project.projectCode }}</h3>
            <p class="text-sm text-gray-600">
              دانشجو: {{ project.student?.firstName }} {{ project.student?.lastName }}
            </p>
          </div>
          <span :class="getStatusClass(project.status)">
            {{ getStatusLabel(project.status) }}
          </span>
        </div>

        <div class="space-y-2">
          <p class="text-sm" v-if="project.topic">
            <span class="text-gray-600">موضوع:</span>
            <span class="font-medium mr-2">{{ project.topic }}</span>
          </p>
          <p class="text-sm">
            <span class="text-gray-600">نقش:</span>
            <span class="font-medium mr-2">
              {{ project.supervisor?._id === userId ? 'استاد راهنما' : 'استاد داور' }}
            </span>
          </p>
          <p class="text-sm" v-if="project.defenseDate">
            <span class="text-gray-600">دفاع:</span>
            <span class="font-medium mr-2">
              {{ toPersianDate(project.defenseDate) }} - {{ project.defenseStartTime }}
            </span>
          </p>
        </div>
      </div>

      <div v-if="filteredProjects.length === 0" class="card text-center py-8">
        <p class="text-gray-500">پروژه‌ای یافت نشد</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { toPersianDate } from '../../utils/date'
import { getStatusLabel, getStatusClass } from '../../utils/status'

const router = useRouter()
const authStore = useAuthStore()
const userId = computed(() => authStore.user?._id)

const projects = ref([])
const loading = ref(true)
const filter = ref('all')
const search = ref('')

const filteredProjects = computed(() => {
  let result = projects.value

  if (filter.value === 'supervising') {
    result = result.filter(p => p.supervisor?._id === userId.value)
  } else if (filter.value === 'examining') {
    result = result.filter(p => p.examiner?._id === userId.value)
  }

  if (search.value) {
    const term = search.value.toLowerCase()
    result = result.filter(p =>
      p.projectCode?.toLowerCase().includes(term) ||
      p.student?.firstName?.toLowerCase().includes(term) ||
      p.student?.lastName?.toLowerCase().includes(term)
    )
  }

  return result
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

function viewProject(id) {
  router.push(`/professor/projects/${id}`)
}
</script>

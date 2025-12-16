<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">داشبورد استاد</h2>
      <p class="text-gray-600">خوش آمدید {{ professor?.firstName }} {{ professor?.lastName }}</p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card bg-blue-50">
          <p class="text-sm text-gray-600">پروژه‌های راهنمایی</p>
          <p class="text-3xl font-bold text-primary">{{ stats.supervisingCount }}</p>
        </div>
        <div class="card bg-green-50">
          <p class="text-sm text-gray-600">پروژه‌های داوری</p>
          <p class="text-3xl font-bold text-primary">{{ stats.examiningCount }}</p>
        </div>
        <div class="card bg-yellow-50">
          <p class="text-sm text-gray-600">موضوعات در انتظار</p>
          <p class="text-3xl font-bold text-secondary">{{ stats.pendingTopics }}</p>
        </div>
        <div class="card bg-purple-50">
          <p class="text-sm text-gray-600">دفاع‌های امروز</p>
          <p class="text-3xl font-bold text-secondary">{{ stats.todayDefenses }}</p>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">پروژه‌های اخیر</h3>
        <div v-if="recentProjects.length > 0" class="space-y-3">
          <div
            v-for="project in recentProjects"
            :key="project._id"
            class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            @click="$router.push(`/professor/projects/${project._id}`)"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium">{{ project.projectCode }}</p>
                <p class="text-sm text-gray-600 mt-1">
                  {{ project.student?.firstName }} {{ project.student?.lastName }}
                </p>
                <p class="text-xs text-gray-500 mt-1" v-if="project.topic">
                  {{ project.topic.substring(0, 60) }}...
                </p>
              </div>
              <span :class="getStatusClass(project.status)">
                {{ getStatusLabel(project.status) }}
              </span>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 text-center py-4">پروژه‌ای وجود ندارد</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { getStatusLabel, getStatusClass } from '../../utils/status'

const professor = ref(null)
const stats = ref({
  supervisingCount: 0,
  examiningCount: 0,
  pendingTopics: 0,
  todayDefenses: 0
})
const recentProjects = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('/professor/dashboard')
    if (response.data.success) {
      professor.value = response.data.professor
      stats.value = response.data.stats
      recentProjects.value = response.data.recentProjects || []
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
})
</script>

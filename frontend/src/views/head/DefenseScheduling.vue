<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">زمان‌بندی دفاع پروژه‌ها</h2>

    <div class="space-y-6">
      <!-- Auto Schedule -->
      <div class="card max-w-2xl">
        <h3 class="text-lg font-bold mb-4">زمان‌بندی خودکار</h3>
        <p class="text-gray-700 mb-4">
          الگوریتم زمان‌بندی به صورت خودکار از میان زمان‌های پیشنهادی اساتید، بهترین زمان را انتخاب کرده و تداخل زمانی را پیشگیری می‌کند.
        </p>

        <button
          @click="autoSchedule"
          class="btn-primary w-full"
          :disabled="scheduling"
        >
          <span v-if="scheduling">در حال زمان‌بندی...</span>
          <span v-else>زمان‌بندی خودکار دفاع‌ها</span>
        </button>

        <div v-if="scheduleSuccess" class="bg-green-100 text-green-700 p-4 rounded-lg mt-4">
          {{ scheduleSuccess }}
        </div>

        <div v-if="scheduleError" class="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
          {{ scheduleError }}
        </div>
      </div>

      <!-- Projects List -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">پروژه‌های آماده دفاع</h3>
        
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="project in readyProjects"
            :key="project._id"
            class="p-4 border rounded-lg"
          >
            <div class="space-y-2">
              <h4 class="font-bold">{{ project.projectCode }}</h4>
              <p class="text-sm text-gray-600">
                دانشجو: {{ project.student?.firstName }} {{ project.student?.lastName }}
              </p>
              <p class="text-sm text-gray-600">
                استاد راهنما: {{ project.supervisor?.firstName }} {{ project.supervisor?.lastName }}
              </p>
              <p class="text-sm text-gray-600">
                استاد داور: {{ project.examiner?.firstName }} {{ project.examiner?.lastName }}
              </p>

              <div v-if="project.defenseDate" class="bg-green-50 p-3 rounded mt-3">
                <p class="font-medium text-green-800">
                  دفاع زمان‌بندی شده:
                  {{ toPersianDate(project.defenseDate) }} - {{ project.defenseStartTime }}
                </p>
              </div>

              <div v-else-if="project.proposedDefenseTimes && project.proposedDefenseTimes.length > 0">
                <p class="text-sm font-medium mt-3 mb-2">زمان‌های پیشنهادی:</p>
                <div class="space-y-1">
                  <div
                    v-for="(time, index) in project.proposedDefenseTimes"
                    :key="index"
                    class="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                  >
                    {{ toPersianDate(time.date) }} - {{ time.startTime }}
                  </div>
                </div>
              </div>
              <div v-else class="bg-yellow-50 p-3 rounded mt-3">
                <p class="text-sm text-yellow-800">
                  استاد هنوز زمان دفاع پیشنهاد نداده است
                </p>
              </div>
            </div>
          </div>

          <div v-if="readyProjects.length === 0" class="text-center py-8 text-gray-500">
            پروژه‌ای برای زمان‌بندی دفاع وجود ندارد
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

const readyProjects = ref([])
const loading = ref(true)
const scheduling = ref(false)
const scheduleSuccess = ref(null)
const scheduleError = ref(null)

onMounted(async () => {
  await fetchProjects()
})

async function fetchProjects() {
  try {
    const response = await api.get('/head/projects')
    if (response.data.success) {
      readyProjects.value = response.data.projects.filter(
        p => p.status === 'ready_for_defense' || p.status === 'defense_scheduled'
      )
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
}

async function autoSchedule() {
  scheduling.value = true
  scheduleSuccess.value = null
  scheduleError.value = null

  try {
    const response = await api.post('/head/schedule-defenses')
    if (response.data.success) {
      scheduleSuccess.value = response.data.message
      await fetchProjects()
    }
  } catch (err) {
    scheduleError.value = err.response?.data?.message || 'خطا در زمان‌بندی'
  } finally {
    scheduling.value = false
  }
}
</script>

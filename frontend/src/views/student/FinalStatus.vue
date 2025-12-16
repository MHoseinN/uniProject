<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">نمره و وضعیت نهایی</h2>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="project" class="card max-w-2xl">
      <div class="space-y-6">
        <div class="text-center pb-6 border-b">
          <h3 class="text-lg font-medium text-gray-600">کد پروژه</h3>
          <p class="text-2xl font-bold text-primary">{{ project.projectCode }}</p>
        </div>

        <div>
          <p class="text-sm text-gray-600">موضوع پروژه</p>
          <p class="font-medium text-lg">{{ project.topic || '-' }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">استاد راهنما</p>
            <p class="font-medium">
              {{ project.supervisor?.firstName }} {{ project.supervisor?.lastName }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">استاد داور</p>
            <p class="font-medium">
              {{ project.examiner?.firstName }} {{ project.examiner?.lastName }}
            </p>
          </div>
        </div>

        <div>
          <p class="text-sm text-gray-600">وضعیت پروژه</p>
          <span :class="getStatusClass(project.status)">
            {{ getStatusLabel(project.status) }}
          </span>
        </div>

        <div v-if="project.defenseDate" class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-bold mb-2">اطلاعات دفاع</h4>
          <div class="space-y-2">
            <p class="text-sm">
              <span class="text-gray-600">تاریخ:</span>
              <span class="font-medium mr-2">{{ toPersianDate(project.defenseDate) }}</span>
            </p>
            <p class="text-sm">
              <span class="text-gray-600">ساعت:</span>
              <span class="font-medium mr-2">{{ project.defenseStartTime }}</span>
            </p>
            <p class="text-sm" v-if="project.defenseLocation">
              <span class="text-gray-600">محل:</span>
              <span class="font-medium mr-2">{{ project.defenseLocation }}</span>
            </p>
          </div>
        </div>

        <div v-if="project.grade !== null && project.grade !== undefined" class="bg-green-50 p-6 rounded-lg text-center">
          <p class="text-sm text-gray-600 mb-2">نمره نهایی</p>
          <p class="text-5xl font-bold text-primary">{{ project.grade }}</p>
          <p class="text-sm text-gray-500 mt-2" v-if="project.gradedAt">
            تاریخ ثبت: {{ toPersianDate(project.gradedAt) }}
          </p>
        </div>

        <div v-else class="bg-yellow-50 p-4 rounded-lg text-center">
          <p class="text-gray-700">نمره هنوز ثبت نشده است</p>
        </div>
      </div>
    </div>

    <div v-else class="card max-w-2xl text-center py-8">
      <p class="text-gray-600">اطلاعات پروژه یافت نشد</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { toPersianDate } from '../../utils/date'
import { getStatusLabel, getStatusClass } from '../../utils/status'

const project = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('/student/final-status')
    if (response.data.success) {
      project.value = response.data.project
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
})
</script>

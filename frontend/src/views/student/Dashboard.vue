<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">داشبورد دانشجو</h2>
      <p class="text-gray-600">خوش آمدید {{ student?.firstName }} {{ student?.lastName }}</p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p class="mt-2 text-gray-600">در حال بارگذاری...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Student Info -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">اطلاعات شخصی</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">نام و نام خانوادگی</p>
            <p class="font-medium">{{ student?.firstName }} {{ student?.lastName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">شماره دانشجویی</p>
            <p class="font-medium">{{ student?.studentNumber }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">رشته</p>
            <p class="font-medium">{{ student?.major }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">ایمیل</p>
            <p class="font-medium">{{ student?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Active Term -->
      <div class="card bg-primary-light bg-opacity-10">
        <h3 class="text-lg font-bold mb-2">ترم فعال</h3>
        <p v-if="term" class="text-lg">{{ term.name }}</p>
        <p v-else class="text-gray-600">هیچ ترم فعالی وجود ندارد</p>
      </div>

      <!-- Project Status -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">وضعیت پروژه</h3>
        <div v-if="project">
          <div class="space-y-3">
            <div>
              <p class="text-sm text-gray-600">کد پروژه</p>
              <p class="font-medium">{{ project.projectCode }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">وضعیت</p>
              <span :class="getStatusClass(project.status)">
                {{ getStatusLabel(project.status) }}
              </span>
            </div>
            <div v-if="project.topic">
              <p class="text-sm text-gray-600">موضوع</p>
              <p class="font-medium">{{ project.topic }}</p>
            </div>
            <div v-if="project.supervisor">
              <p class="text-sm text-gray-600">استاد راهنما</p>
              <p class="font-medium">
                {{ project.supervisor.firstName }} {{ project.supervisor.lastName }}
              </p>
            </div>
            <div v-if="project.examiner">
              <p class="text-sm text-gray-600">استاد داور</p>
              <p class="font-medium">
                {{ project.examiner.firstName }} {{ project.examiner.lastName }}
              </p>
            </div>
            <div v-if="project.defenseDate">
              <p class="text-sm text-gray-600">تاریخ دفاع</p>
              <p class="font-medium">{{ toPersianDate(project.defenseDate) }} - {{ project.defenseStartTime }}</p>
            </div>
            <div v-if="project.grade !== null && project.grade !== undefined">
              <p class="text-sm text-gray-600">نمره</p>
              <p class="font-medium text-xl text-primary">{{ project.grade }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-600 mb-4">شما هنوز پروژه‌ای ندارید</p>
          <router-link to="/student/request-project" class="btn-primary">
            درخواست اخذ پروژه
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { toPersianDate } from '../../utils/date'
import { getStatusLabel, getStatusClass } from '../../utils/status'

const student = ref(null)
const project = ref(null)
const term = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('/student/dashboard')
    if (response.data.success) {
      student.value = response.data.student
      project.value = response.data.project
      term.value = response.data.term
    }
  } catch (error) {
    console.error('خطا در دریافت داشبورد:', error)
  } finally {
    loading.value = false
  }
})
</script>


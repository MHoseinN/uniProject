<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">داشبورد مدیر گروه</h2>
      <p class="text-gray-600">خوش آمدید {{ head?.firstName }} {{ head?.lastName }}</p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card bg-blue-50">
          <p class="text-sm text-gray-600">کل پروژه‌ها</p>
          <p class="text-3xl font-bold text-primary">{{ stats.totalProjects }}</p>
        </div>
        <div class="card bg-yellow-50">
          <p class="text-sm text-gray-600">در انتظار تخصیص</p>
          <p class="text-3xl font-bold text-secondary">{{ stats.pendingProjects }}</p>
        </div>
        <div class="card bg-green-50">
          <p class="text-sm text-gray-600">در حال انجام</p>
          <p class="text-3xl font-bold text-primary">{{ stats.inProgressProjects }}</p>
        </div>
        <div class="card bg-purple-50">
          <p class="text-sm text-gray-600">تکمیل شده</p>
          <p class="text-3xl font-bold text-primary">{{ stats.completedProjects }}</p>
        </div>
      </div>

      <!-- Active Term -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">ترم فعال</h3>
        <div v-if="activeTerm" class="space-y-2">
          <p><span class="font-medium">نام ترم:</span> {{ activeTerm.name }}</p>
          <p><span class="font-medium">شروع:</span> {{ toPersianDate(activeTerm.startDate) }}</p>
          <p><span class="font-medium">پایان:</span> {{ toPersianDate(activeTerm.endDate) }}</p>
          <span :class="activeTerm.isActive ? 'badge-success' : 'badge-danger'">
            {{ activeTerm.isActive ? 'فعال' : 'غیرفعال' }}
          </span>
        </div>
        <p v-else class="text-gray-500">ترم فعالی وجود ندارد</p>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">عملیات سریع</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <router-link to="/head/term-management" class="btn-primary text-center py-3">
            مدیریت ترم
          </router-link>
          <router-link to="/head/assignment" class="btn-primary text-center py-3">
            تخصیص استاد
          </router-link>
          <router-link to="/head/defense-scheduling" class="btn-primary text-center py-3">
            زمان‌بندی دفاع
          </router-link>
          <router-link to="/head/capacity" class="btn-secondary text-center py-3">
            تنظیم ظرفیت
          </router-link>
          <router-link to="/head/projects" class="btn-outline text-center py-3">
            مشاهده پروژه‌ها
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

const head = ref(null)
const stats = ref({
  totalProjects: 0,
  pendingProjects: 0,
  inProgressProjects: 0,
  completedProjects: 0
})
const activeTerm = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('/head/dashboard')
    if (response.data.success) {
      head.value = response.data.head
      stats.value = response.data.stats
      activeTerm.value = response.data.activeTerm
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
})
</script>

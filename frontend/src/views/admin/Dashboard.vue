<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">داشبورد مدیر سیستم</h2>
      <p class="text-gray-600">خوش آمدید {{ admin?.firstName }} {{ admin?.lastName }}</p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card bg-blue-50">
          <p class="text-sm text-gray-600">کل کاربران</p>
          <p class="text-3xl font-bold text-primary">{{ stats.totalUsers }}</p>
        </div>
        <div class="card bg-green-50">
          <p class="text-sm text-gray-600">دانشجویان</p>
          <p class="text-3xl font-bold text-primary">{{ stats.students }}</p>
        </div>
        <div class="card bg-yellow-50">
          <p class="text-sm text-gray-600">اساتید</p>
          <p class="text-3xl font-bold text-secondary">{{ stats.professors }}</p>
        </div>
        <div class="card bg-purple-50">
          <p class="text-sm text-gray-600">کل پروژه‌ها</p>
          <p class="text-3xl font-bold text-primary">{{ stats.totalProjects }}</p>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">آخرین فعالیت‌ها</h3>
        <div v-if="recentActivities.length > 0" class="space-y-2">
          <div
            v-for="activity in recentActivities"
            :key="activity._id"
            class="p-3 bg-gray-50 rounded flex justify-between items-center"
          >
            <div>
              <p class="text-sm font-medium">{{ activity.action }}</p>
              <p class="text-xs text-gray-600">
                {{ activity.user?.firstName }} {{ activity.user?.lastName }}
              </p>
            </div>
            <p class="text-xs text-gray-500">
              {{ toPersianDateTime(activity.timestamp) }}
            </p>
          </div>
        </div>
        <p v-else class="text-gray-500 text-center py-4">فعالیتی وجود ندارد</p>
      </div>

      <!-- Pending Approvals -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">کاربران در انتظار تأیید</h3>
        <div v-if="pendingUsers.length > 0" class="space-y-2">
          <div
            v-for="user in pendingUsers"
            :key="user._id"
            class="p-3 bg-yellow-50 rounded flex justify-between items-center"
          >
            <div>
              <p class="font-medium">{{ user.firstName }} {{ user.lastName }}</p>
              <p class="text-sm text-gray-600">{{ user.email }} - {{ getRoleLabel(user.role) }}</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="approveUser(user._id)"
                class="btn-primary text-sm px-3 py-1"
              >
                تأیید
              </button>
              <button
                @click="rejectUser(user._id)"
                class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition"
              >
                رد
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 text-center py-4">کاربری در انتظار تأیید نیست</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { toPersianDateTime } from '../../utils/date'

const admin = ref(null)
const stats = ref({
  totalUsers: 0,
  students: 0,
  professors: 0,
  totalProjects: 0
})
const recentActivities = ref([])
const pendingUsers = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('/admin/dashboard')
    if (response.data.success) {
      admin.value = response.data.admin
      stats.value = response.data.stats
      recentActivities.value = response.data.recentActivities || []
      pendingUsers.value = response.data.pendingUsers || []
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
})

function getRoleLabel(role) {
  const labels = {
    student: 'دانشجو',
    professor: 'استاد',
    head_of_department: 'مدیر گروه',
    admin: 'مدیر سیستم'
  }
  return labels[role] || role
}

async function approveUser(userId) {
  try {
    const response = await api.post(`/admin/user/${userId}/approve`)
    if (response.data.success) {
      pendingUsers.value = pendingUsers.value.filter(u => u._id !== userId)
    }
  } catch (error) {
    alert(error.response?.data?.message || 'خطا در تأیید کاربر')
  }
}

async function rejectUser(userId) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این کاربر را رد کنید؟')) return

  try {
    const response = await api.delete(`/admin/user/${userId}`)
    if (response.data.success) {
      pendingUsers.value = pendingUsers.value.filter(u => u._id !== userId)
    }
  } catch (error) {
    alert(error.response?.data?.message || 'خطا در رد کاربر')
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">گزارش فعالیت‌های سیستم</h2>

    <div class="card mb-6">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">نوع عملیات</label>
          <select v-model="actionFilter" class="input-field">
            <option value="">همه</option>
            <option value="user_login">ورود کاربر</option>
            <option value="user_register">ثبت‌نام کاربر</option>
            <option value="project_request">درخواست پروژه</option>
            <option value="topic_proposal">پیشنهاد موضوع</option>
            <option value="topic_approve">تأیید موضوع</option>
            <option value="topic_reject">رد موضوع</option>
            <option value="report_submit">ارسال گزارش</option>
            <option value="supervisor_assign">تخصیص استاد راهنما</option>
            <option value="examiner_assign">تخصیص استاد داور</option>
            <option value="defense_schedule">زمان‌بندی دفاع</option>
            <option value="grade_submit">ثبت نمره</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">کاربر</label>
          <input
            v-model="userSearch"
            type="text"
            class="input-field"
            placeholder="نام کاربر..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">تعداد نمایش</label>
          <select v-model.number="limit" class="input-field">
            <option :value="50">50</option>
            <option :value="100">100</option>
            <option :value="200">200</option>
            <option :value="500">500</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="card">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b-2 border-gray-200">
              <th class="text-right p-2">زمان</th>
              <th class="text-right p-2">کاربر</th>
              <th class="text-right p-2">عملیات</th>
              <th class="text-right p-2">جزئیات</th>
              <th class="text-right p-2">IP</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in filteredLogs"
              :key="log._id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="p-2 text-gray-600">
                {{ toPersianDateTime(log.timestamp) }}
              </td>
              <td class="p-2">
                {{ log.user?.firstName }} {{ log.user?.lastName }}
              </td>
              <td class="p-2">
                <span class="badge-secondary">{{ getActionLabel(log.action) }}</span>
              </td>
              <td class="p-2 text-gray-600">
                {{ log.details || '-' }}
              </td>
              <td class="p-2 text-gray-500 text-xs">
                {{ log.ipAddress || '-' }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredLogs.length === 0" class="text-center py-8 text-gray-500">
          فعالیتی یافت نشد
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../../services/api'
import { toPersianDateTime } from '../../utils/date'

const logs = ref([])
const loading = ref(true)
const actionFilter = ref('')
const userSearch = ref('')
const limit = ref(100)

const filteredLogs = computed(() => {
  let result = logs.value

  if (actionFilter.value) {
    result = result.filter(l => l.action === actionFilter.value)
  }

  if (userSearch.value) {
    const term = userSearch.value.toLowerCase()
    result = result.filter(l =>
      l.user?.firstName?.toLowerCase().includes(term) ||
      l.user?.lastName?.toLowerCase().includes(term)
    )
  }

  return result
})

watch(limit, () => {
  fetchLogs()
})

onMounted(async () => {
  await fetchLogs()
})

async function fetchLogs() {
  loading.value = true
  try {
    const response = await api.get(`/admin/audit-logs?limit=${limit.value}`)
    if (response.data.success) {
      logs.value = response.data.logs
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
}

function getActionLabel(action) {
  const labels = {
    user_login: 'ورود',
    user_register: 'ثبت‌نام',
    project_request: 'درخواست پروژه',
    topic_proposal: 'پیشنهاد موضوع',
    topic_approve: 'تأیید موضوع',
    topic_reject: 'رد موضوع',
    report_submit: 'ارسال گزارش',
    supervisor_assign: 'تخصیص راهنما',
    examiner_assign: 'تخصیص داور',
    defense_schedule: 'زمان‌بندی دفاع',
    grade_submit: 'ثبت نمره'
  }
  return labels[action] || action
}
</script>

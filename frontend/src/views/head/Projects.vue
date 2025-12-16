<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">مدیریت پروژه‌ها</h2>

    <div class="card mb-6">
      <div class="flex gap-4 items-center">
        <select v-model="statusFilter" class="input-field flex-1">
          <option value="">همه وضعیت‌ها</option>
          <option value="pending_approval">در انتظار تأیید</option>
          <option value="approved">تأیید شده</option>
          <option value="topic_selection">انتخاب موضوع</option>
          <option value="in_progress">در حال انجام</option>
          <option value="ready_for_defense">آماده دفاع</option>
          <option value="defense_scheduled">دفاع زمان‌بندی شده</option>
          <option value="defense_completed">دفاع انجام شده</option>
          <option value="graded">نمره‌دهی شده</option>
        </select>
        <input
          v-model="search"
          type="text"
          class="input-field flex-1"
          placeholder="جستجو..."
        />
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-gray-200">
              <th class="text-right p-3">کد پروژه</th>
              <th class="text-right p-3">دانشجو</th>
              <th class="text-right p-3">استاد راهنما</th>
              <th class="text-right p-3">استاد داور</th>
              <th class="text-center p-3">وضعیت</th>
              <th class="text-center p-3">نمره</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="project in filteredProjects"
              :key="project._id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="p-3 font-medium">{{ project.projectCode }}</td>
              <td class="p-3">
                {{ project.student?.firstName }} {{ project.student?.lastName }}
              </td>
              <td class="p-3">
                {{ project.supervisor?.firstName || '-' }} {{ project.supervisor?.lastName || '' }}
              </td>
              <td class="p-3">
                {{ project.examiner?.firstName || '-' }} {{ project.examiner?.lastName || '' }}
              </td>
              <td class="text-center p-3">
                <span :class="getStatusClass(project.status)">
                  {{ getStatusLabel(project.status) }}
                </span>
              </td>
              <td class="text-center p-3 font-bold text-primary">
                {{ project.grade !== null && project.grade !== undefined ? project.grade : '-' }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredProjects.length === 0" class="text-center py-8 text-gray-500">
          پروژه‌ای یافت نشد
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'
import { getStatusLabel, getStatusClass } from '../../utils/status'

const projects = ref([])
const loading = ref(true)
const statusFilter = ref('')
const search = ref('')

const filteredProjects = computed(() => {
  let result = projects.value

  if (statusFilter.value) {
    result = result.filter(p => p.status === statusFilter.value)
  }

  if (search.value) {
    const term = search.value.toLowerCase()
    result = result.filter(p =>
      p.projectCode?.toLowerCase().includes(term) ||
      p.student?.firstName?.toLowerCase().includes(term) ||
      p.student?.lastName?.toLowerCase().includes(term) ||
      p.topic?.toLowerCase().includes(term)
    )
  }

  return result
})

onMounted(async () => {
  try {
    const response = await api.get('/head/projects')
    if (response.data.success) {
      projects.value = response.data.projects
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
})
</script>

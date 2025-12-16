<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">تخصیص استاد به پروژه‌ها</h2>

    <div class="space-y-6">
      <!-- Auto Assignment -->
      <div class="card max-w-2xl">
        <h3 class="text-lg font-bold mb-4">تخصیص خودکار</h3>
        <p class="text-gray-700 mb-4">
          با استفاده از الگوریتم توزیع عادلانه، استادان راهنما و داور به صورت خودکار به پروژه‌های در انتظار تخصیص می‌یابند.
        </p>

        <div class="space-y-3">
          <button
            @click="autoAssignSupervisors"
            class="btn-primary w-full"
            :disabled="assigning.supervisors"
          >
            <span v-if="assigning.supervisors">در حال تخصیص استاد راهنما...</span>
            <span v-else">تخصیص خودکار استاد راهنما</span>
          </button>

          <button
            @click="autoAssignExaminers"
            class="btn-secondary w-full"
            :disabled="assigning.examiners"
          >
            <span v-if="assigning.examiners">در حال تخصیص استاد داور...</span>
            <span v-else>تخصیص خودکار استاد داور</span>
          </button>
        </div>

        <div v-if="assignSuccess" class="bg-green-100 text-green-700 p-4 rounded-lg mt-4">
          {{ assignSuccess }}
        </div>

        <div v-if="assignError" class="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
          {{ assignError }}
        </div>
      </div>

      <!-- Manual Assignment -->
      <div class="card">
        <h3 class="text-lg font-bold mb-4">تخصیص دستی</h3>
        
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="project in unassignedProjects"
            :key="project._id"
            class="p-4 border rounded-lg"
          >
            <div class="mb-3">
              <h4 class="font-bold">{{ project.projectCode }}</h4>
              <p class="text-sm text-gray-600">
                دانشجو: {{ project.student?.firstName }} {{ project.student?.lastName }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">استاد راهنما</label>
                <select
                  v-model="manualAssignments[project._id].supervisor"
                  class="input-field"
                >
                  <option value="">انتخاب کنید</option>
                  <option
                    v-for="prof in professors"
                    :key="prof._id"
                    :value="prof._id"
                  >
                    {{ prof.firstName }} {{ prof.lastName }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">استاد داور</label>
                <select
                  v-model="manualAssignments[project._id].examiner"
                  class="input-field"
                >
                  <option value="">انتخاب کنید</option>
                  <option
                    v-for="prof in professors"
                    :key="prof._id"
                    :value="prof._id"
                    :disabled="prof._id === manualAssignments[project._id].supervisor"
                  >
                    {{ prof.firstName }} {{ prof.lastName }}
                  </option>
                </select>
              </div>
            </div>

            <button
              @click="manualAssign(project._id)"
              class="btn-primary mt-3 text-sm px-4 py-1"
              :disabled="!manualAssignments[project._id].supervisor || !manualAssignments[project._id].examiner"
            >
              تخصیص
            </button>
          </div>

          <div v-if="unassignedProjects.length === 0" class="text-center py-8 text-gray-500">
            همه پروژه‌ها تخصیص یافته‌اند
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'

const unassignedProjects = ref([])
const professors = ref([])
const loading = ref(true)
const assigning = reactive({
  supervisors: false,
  examiners: false
})
const assignSuccess = ref(null)
const assignError = ref(null)
const manualAssignments = reactive({})

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  try {
    const [projectsRes, profsRes] = await Promise.all([
      api.get('/head/projects'),
      api.get('/head/professors')
    ])

    if (projectsRes.data.success) {
      unassignedProjects.value = projectsRes.data.projects.filter(
        p => !p.supervisor || !p.examiner
      )
      unassignedProjects.value.forEach(p => {
        manualAssignments[p._id] = { supervisor: '', examiner: '' }
      })
    }

    if (profsRes.data.success) {
      professors.value = profsRes.data.professors
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
}

async function autoAssignSupervisors() {
  assigning.supervisors = true
  assignSuccess.value = null
  assignError.value = null

  try {
    const response = await api.post('/head/assign-supervisors')
    if (response.data.success) {
      assignSuccess.value = response.data.message
      await fetchData()
    }
  } catch (err) {
    assignError.value = err.response?.data?.message || 'خطا در تخصیص'
  } finally {
    assigning.supervisors = false
  }
}

async function autoAssignExaminers() {
  assigning.examiners = true
  assignSuccess.value = null
  assignError.value = null

  try {
    const response = await api.post('/head/assign-examiners')
    if (response.data.success) {
      assignSuccess.value = response.data.message
      await fetchData()
    }
  } catch (err) {
    assignError.value = err.response?.data?.message || 'خطا در تخصیص'
  } finally {
    assigning.examiners = false
  }
}

async function manualAssign(projectId) {
  try {
    const response = await api.post(`/head/project/${projectId}/assign`, {
      supervisorId: manualAssignments[projectId].supervisor,
      examinerId: manualAssignments[projectId].examiner
    })
    if (response.data.success) {
      await fetchData()
    }
  } catch (error) {
    alert(error.response?.data?.message || 'خطا در تخصیص')
  }
}
</script>

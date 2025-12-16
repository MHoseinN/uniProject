<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">مدیریت ظرفیت اساتید</h2>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-gray-200">
              <th class="text-right p-3">نام استاد</th>
              <th class="text-right p-3">رشته</th>
              <th class="text-center p-3">حداکثر راهنمایی</th>
              <th class="text-center p-3">تعداد فعلی راهنمایی</th>
              <th class="text-center p-3">حداکثر داوری</th>
              <th class="text-center p-3">تعداد فعلی داوری</th>
              <th class="text-center p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="prof in professors"
              :key="prof._id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="p-3">{{ prof.firstName }} {{ prof.lastName }}</td>
              <td class="p-3">{{ prof.major || '-' }}</td>
              <td class="text-center p-3">
                <input
                  v-model.number="capacities[prof._id].maxSupervisees"
                  type="number"
                  min="0"
                  class="w-20 px-2 py-1 border rounded text-center"
                />
              </td>
              <td class="text-center p-3">{{ prof.currentSupervisees || 0 }}</td>
              <td class="text-center p-3">
                <input
                  v-model.number="capacities[prof._id].maxExaminees"
                  type="number"
                  min="0"
                  class="w-20 px-2 py-1 border rounded text-center"
                />
              </td>
              <td class="text-center p-3">{{ prof.currentExaminees || 0 }}</td>
              <td class="text-center p-3">
                <button
                  @click="updateCapacity(prof._id)"
                  class="btn-primary text-sm px-3 py-1"
                  :disabled="updating[prof._id]"
                >
                  <span v-if="updating[prof._id]">...</span>
                  <span v-else>به‌روزرسانی</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="successMessage" class="bg-green-100 text-green-700 p-4 rounded-lg mt-4">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'

const professors = ref([])
const capacities = reactive({})
const updating = reactive({})
const loading = ref(true)
const successMessage = ref(null)
const errorMessage = ref(null)

onMounted(async () => {
  try {
    const response = await api.get('/head/professors')
    if (response.data.success) {
      professors.value = response.data.professors
      professors.value.forEach(prof => {
        capacities[prof._id] = {
          maxSupervisees: prof.maxSupervisees || 5,
          maxExaminees: prof.maxExaminees || 10
        }
      })
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
})

async function updateCapacity(professorId) {
  updating[professorId] = true
  successMessage.value = null
  errorMessage.value = null

  try {
    const response = await api.post(`/head/professor/${professorId}/capacity`, {
      maxSupervisees: capacities[professorId].maxSupervisees,
      maxExaminees: capacities[professorId].maxExaminees
    })
    if (response.data.success) {
      successMessage.value = 'ظرفیت با موفقیت به‌روزرسانی شد'
      setTimeout(() => { successMessage.value = null }, 3000)
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'خطا در به‌روزرسانی'
  } finally {
    updating[professorId] = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">موضوعات پیشنهادی دانشجویان</h2>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="project in projectsWithTopics"
        :key="project._id"
        class="card"
      >
        <div class="mb-4">
          <h3 class="font-bold">{{ project.projectCode }}</h3>
          <p class="text-sm text-gray-600">
            دانشجو: {{ project.student?.firstName }} {{ project.student?.lastName }}
          </p>
        </div>

        <div class="space-y-4">
          <div
            v-for="(topic, index) in project.proposedTopics"
            :key="index"
            class="p-4 border rounded-lg"
            :class="{
              'bg-green-50 border-green-200': topic.status === 'approved',
              'bg-red-50 border-red-200': topic.status === 'rejected',
              'bg-yellow-50 border-yellow-200': topic.status === 'pending'
            }"
          >
            <div class="flex justify-between items-start mb-2">
              <p class="text-sm text-gray-500">{{ toPersianDate(topic.proposedAt) }}</p>
              <span
                v-if="topic.status === 'approved'"
                class="badge-success"
              >
                تأیید شده
              </span>
              <span
                v-else-if="topic.status === 'rejected'"
                class="badge-danger"
              >
                رد شده
              </span>
              <span v-else class="badge-warning">در انتظار</span>
            </div>

            <p class="text-gray-700 mb-4">{{ topic.topic }}</p>

            <div v-if="topic.status === 'pending'" class="flex gap-2">
              <button
                @click="handleTopicAction(project._id, index, 'approve')"
                class="btn-primary text-sm px-4 py-1"
              >
                تأیید
              </button>
              <button
                @click="handleTopicAction(project._id, index, 'reject')"
                class="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1 rounded transition"
              >
                رد
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="projectsWithTopics.length === 0" class="card text-center py-8">
        <p class="text-gray-500">موضوع پیشنهادی جدیدی وجود ندارد</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { toPersianDate } from '../../utils/date'

const projectsWithTopics = ref([])
const loading = ref(true)

onMounted(async () => {
  await fetchTopics()
})

async function fetchTopics() {
  try {
    const response = await api.get('/professor/projects')
    if (response.data.success) {
      projectsWithTopics.value = response.data.projects.filter(
        p => p.proposedTopics && p.proposedTopics.length > 0
      )
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
}

async function handleTopicAction(projectId, topicIndex, action) {
  try {
    const response = await api.post(`/professor/topics/${action}`, {
      projectId,
      topicIndex
    })
    if (response.data.success) {
      await fetchTopics()
    }
  } catch (error) {
    console.error('خطا:', error)
    alert(error.response?.data?.message || 'خطا در عملیات')
  }
}
</script>

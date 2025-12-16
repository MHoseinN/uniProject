<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">پیام‌ها</h2>

    <div class="grid grid-cols-3 gap-6">
      <!-- Inbox List -->
      <div class="card col-span-1 max-h-screen overflow-y-auto">
        <h3 class="font-bold mb-4">صندوق ورودی</h3>
        <div class="space-y-2">
          <div
            v-for="msg in messages"
            :key="msg._id"
            class="p-3 border rounded cursor-pointer hover:bg-gray-50"
            :class="{ 'bg-blue-50 border-blue-200': selectedMessage?._id === msg._id }"
            @click="selectMessage(msg)"
          >
            <p class="font-medium text-sm">{{ msg.sender?.firstName }} {{ msg.sender?.lastName }}</p>
            <p class="text-xs text-gray-600 truncate">{{ msg.subject }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ toPersianDate(msg.createdAt) }}</p>
            <span v-if="!msg.isRead" class="badge-warning text-xs">جدید</span>
          </div>

          <div v-if="messages.length === 0" class="text-center py-8 text-gray-500">
            پیامی وجود ندارد
          </div>
        </div>
      </div>

      <!-- Message Detail -->
      <div class="card col-span-2">
        <div v-if="selectedMessage">
          <div class="border-b pb-4 mb-4">
            <h3 class="text-lg font-bold">{{ selectedMessage.subject }}</h3>
            <p class="text-sm text-gray-600 mt-2">
              از: {{ selectedMessage.sender?.firstName }} {{ selectedMessage.sender?.lastName }}
              ({{ selectedMessage.sender?.email }})
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ toPersianDateTime(selectedMessage.createdAt) }}
            </p>
          </div>

          <div class="mb-6">
            <p class="whitespace-pre-wrap">{{ selectedMessage.content }}</p>
          </div>

          <div class="border-t pt-4">
            <h4 class="font-bold mb-3">پاسخ</h4>
            <form @submit.prevent="sendReply" class="space-y-3">
              <textarea
                v-model="replyContent"
                class="input-field min-h-[120px]"
                placeholder="پاسخ خود را بنویسید..."
                required
              ></textarea>

              <div v-if="replySuccess" class="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
                {{ replySuccess }}
              </div>

              <div v-if="replyError" class="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                {{ replyError }}
              </div>

              <button type="submit" class="btn-primary" :disabled="sending">
                <span v-if="sending">در حال ارسال...</span>
                <span v-else>ارسال پاسخ</span>
              </button>
            </form>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500">
          پیامی را انتخاب کنید
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { toPersianDate, toPersianDateTime } from '../../utils/date'

const messages = ref([])
const selectedMessage = ref(null)
const replyContent = ref('')
const sending = ref(false)
const replySuccess = ref(null)
const replyError = ref(null)

onMounted(async () => {
  await fetchMessages()
})

async function fetchMessages() {
  try {
    const response = await api.get('/messages/inbox')
    if (response.data.success) {
      messages.value = response.data.messages
    }
  } catch (error) {
    console.error('خطا:', error)
  }
}

async function selectMessage(msg) {
  selectedMessage.value = msg
  replyContent.value = ''
  replySuccess.value = null
  replyError.value = null

  if (!msg.isRead) {
    try {
      await api.post(`/messages/${msg._id}/read`)
      msg.isRead = true
    } catch (error) {
      console.error('خطا در علامت‌گذاری پیام:', error)
    }
  }
}

async function sendReply() {
  sending.value = true
  replySuccess.value = null
  replyError.value = null

  try {
    const response = await api.post('/messages/send', {
      recipientId: selectedMessage.value.sender._id,
      subject: `Re: ${selectedMessage.value.subject}`,
      content: replyContent.value
    })
    if (response.data.success) {
      replySuccess.value = 'پاسخ با موفقیت ارسال شد'
      replyContent.value = ''
    }
  } catch (err) {
    replyError.value = err.response?.data?.message || 'خطا در ارسال پاسخ'
  } finally {
    sending.value = false
  }
}
</script>

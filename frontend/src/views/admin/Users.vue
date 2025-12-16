<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">مدیریت کاربران</h2>

    <div class="card mb-6">
      <div class="flex gap-4 items-center">
        <select v-model="roleFilter" class="input-field flex-1">
          <option value="">همه نقش‌ها</option>
          <option value="student">دانشجو</option>
          <option value="professor">استاد</option>
          <option value="head_of_department">مدیر گروه</option>
          <option value="admin">مدیر سیستم</option>
        </select>
        <select v-model="approvalFilter" class="input-field flex-1">
          <option value="">همه</option>
          <option value="approved">تأیید شده</option>
          <option value="pending">در انتظار تأیید</option>
        </select>
        <input
          v-model="search"
          type="text"
          class="input-field flex-1"
          placeholder="جستجو در نام، ایمیل..."
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
              <th class="text-right p-3">نام و نام خانوادگی</th>
              <th class="text-right p-3">ایمیل</th>
              <th class="text-center p-3">نقش</th>
              <th class="text-center p-3">وضعیت</th>
              <th class="text-center p-3">تاریخ ثبت‌نام</th>
              <th class="text-center p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user._id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="p-3">{{ user.firstName }} {{ user.lastName }}</td>
              <td class="p-3">{{ user.email }}</td>
              <td class="text-center p-3">
                <span class="badge-secondary">{{ getRoleLabel(user.role) }}</span>
              </td>
              <td class="text-center p-3">
                <span :class="user.isApproved ? 'badge-success' : 'badge-warning'">
                  {{ user.isApproved ? 'تأیید شده' : 'در انتظار' }}
                </span>
              </td>
              <td class="text-center p-3 text-sm text-gray-600">
                {{ toPersianDate(user.createdAt) }}
              </td>
              <td class="text-center p-3">
                <div class="flex gap-2 justify-center">
                  <button
                    v-if="!user.isApproved"
                    @click="approveUser(user._id)"
                    class="btn-primary text-sm px-3 py-1"
                  >
                    تأیید
                  </button>
                  <button
                    @click="deleteUser(user._id)"
                    class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredUsers.length === 0" class="text-center py-8 text-gray-500">
          کاربری یافت نشد
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'
import { toPersianDate } from '../../utils/date'

const users = ref([])
const loading = ref(true)
const roleFilter = ref('')
const approvalFilter = ref('')
const search = ref('')

const filteredUsers = computed(() => {
  let result = users.value

  if (roleFilter.value) {
    result = result.filter(u => u.role === roleFilter.value)
  }

  if (approvalFilter.value === 'approved') {
    result = result.filter(u => u.isApproved)
  } else if (approvalFilter.value === 'pending') {
    result = result.filter(u => !u.isApproved)
  }

  if (search.value) {
    const term = search.value.toLowerCase()
    result = result.filter(u =>
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    )
  }

  return result
})

onMounted(async () => {
  await fetchUsers()
})

async function fetchUsers() {
  try {
    const response = await api.get('/admin/users')
    if (response.data.success) {
      users.value = response.data.users
    }
  } catch (error) {
    console.error('خطا:', error)
  } finally {
    loading.value = false
  }
}

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
      await fetchUsers()
    }
  } catch (error) {
    alert(error.response?.data?.message || 'خطا در تأیید کاربر')
  }
}

async function deleteUser(userId) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) return

  try {
    const response = await api.delete(`/admin/user/${userId}`)
    if (response.data.success) {
      users.value = users.value.filter(u => u._id !== userId)
    }
  } catch (error) {
    alert(error.response?.data?.message || 'خطا در حذف کاربر')
  }
}
</script>

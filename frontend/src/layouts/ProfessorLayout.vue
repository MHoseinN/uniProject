<template>
  <div class="min-h-screen bg-light">
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-primary">پنل استاد</h1>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm">{{ user?.firstName }} {{ user?.lastName }}</span>
            <button @click="logout" class="btn-outline text-sm py-1 px-4">خروج</button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-6">
        <aside class="w-64 flex-shrink-0">
          <div class="card space-y-2">
            <router-link
              to="/professor/dashboard"
              class="block px-4 py-2 rounded hover:bg-primary-light hover:text-white transition"
              :class="{ 'bg-primary text-white': $route.name === 'professor-dashboard' }"
            >
              داشبورد
            </router-link>
            <router-link
              to="/professor/projects"
              class="block px-4 py-2 rounded hover:bg-primary-light hover:text-white transition"
              :class="{ 'bg-primary text-white': $route.name === 'professor-projects' }"
            >
              پروژه‌ها
            </router-link>
            <router-link
              to="/professor/topics"
              class="block px-4 py-2 rounded hover:bg-primary-light hover:text-white transition"
              :class="{ 'bg-primary text-white': $route.name === 'professor-topics' }"
            >
              موضوعات پیشنهادی
            </router-link>
            <router-link
              to="/professor/defense-times"
              class="block px-4 py-2 rounded hover:bg-primary-light hover:text-white transition"
              :class="{ 'bg-primary text-white': $route.name === 'professor-defense-times' }"
            >
              زمان‌های دفاع
            </router-link>
            <router-link
              to="/professor/grading"
              class="block px-4 py-2 rounded hover:bg-primary-light hover:text-white transition"
              :class="{ 'bg-primary text-white': $route.name === 'professor-grading' }"
            >
              نمره‌دهی
            </router-link>
            <router-link
              to="/professor/messages"
              class="block px-4 py-2 rounded hover:bg-primary-light hover:text-white transition"
              :class="{ 'bg-primary text-white': $route.name === 'professor-messages' }"
            >
              پیام‌ها
            </router-link>
          </div>
        </aside>

        <main class="flex-1">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

function logout() {
  authStore.logout()
}
</script>

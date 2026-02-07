<template>
  <div>
    <nav class="bg-green-900 text-white shadow-lg">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold flex items-center gap-2">
              RentShot
            </router-link>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-6">
            <!-- Public Links -->
            <router-link to="/"
              class="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="{ 'bg-white/20': $route.path === '/' }">
              خانه
            </router-link>

            <router-link to="/about"
              class="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="{ 'bg-white/20': $route.path === '/about' }">
              درباره ما
            </router-link>

            <!-- User-specific Links -->
            <template v-if="isUserLoggedIn && userRole === 'user'">
              <router-link to="/reserve"
                class="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                :class="{ 'bg-white/20': $route.path === '/reserve' }">
                رزرو
              </router-link>

              <router-link to="/basket"
                class="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative"
                :class="{ 'bg-white/20': $route.path === '/basket' }">
                سبد رزرو
              </router-link>
            </template>

            <!-- User Panel Dropdown -->
            <div v-if="isUserLoggedIn && userRole === 'user'" class="relative" ref="userDropdown">
              <button @click="userMenuOpen = !userMenuOpen"
                class="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2">
                {{ userName }}
                <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': userMenuOpen }"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <div v-if="userMenuOpen" class="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <router-link to="/my-panel"
                  class="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors duration-200"
                  @click="userMenuOpen = false">
                  پنل کاربری
                </router-link>
                <button @click="logout"
                  class="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200">
                  خروج
                </button>
              </div>
            </div>

            <!-- Admin Panel Dropdown -->
            <div v-if="isUserLoggedIn && userRole === 'admin'" class="relative" ref="adminDropdown">
              <button @click="adminMenuOpen = !adminMenuOpen"
                class="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2">
                پنل مدیریت
                <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': adminMenuOpen }"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <div v-if="adminMenuOpen" class="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                <router-link to="/admin"
                  class="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors duration-200"
                  @click="adminMenuOpen = false">
                  داشبورد مدیریت
                </router-link>
                <router-link to="/admin/products"
                  class="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors duration-200"
                  @click="adminMenuOpen = false">
                  مدیریت محصولات
                </router-link>
                <router-link to="/admin/queue-users"
                  class="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors duration-200"
                  @click="adminMenuOpen = false">
                  کاربران در انتظار
                </router-link>
                <router-link to="/admin/registered-users"
                  class="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors duration-200"
                  @click="adminMenuOpen = false">
                  کاربران تایید شده
                </router-link>
                <router-link to="/admin/reserved-lists"
                  class="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors duration-200"
                  @click="adminMenuOpen = false">
                  مدیریت رزروها
                </router-link>
                <router-link to="/admin/income"
                  class="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors duration-200"
                  @click="adminMenuOpen = false">
                  گزارش درآمد
                </router-link>
                <hr class="my-2" />
                <button @click="logout"
                  class="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200">
                  خروج
                </button>
              </div>
            </div>

            <!-- Auth Links (for non-logged in users) -->
            <template v-if="!isUserLoggedIn">
              <router-link to="/login"
                class="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                :class="{ 'bg-white/20': $route.path === '/login' }">
                ورود
              </router-link>

              <router-link to="/register"
                class="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                :class="{ 'bg-white/40': $route.path === '/register' }">
                ثبت‌نام
              </router-link>
            </template>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button @click="mobileMenuOpen = !mobileMenuOpen" type="button"
              class="inline-flex items-center justify-center rounded-md bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none transition-colors duration-200">
              <svg class="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16">
                </path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white/10 backdrop-blur-lg">
        <div class="space-y-1 px-4 pt-2 pb-4">
          <router-link to="/"
            class="block rounded-md px-3 py-2 text-base font-medium hover:bg-white/20 transition-colors duration-200"
            @click="mobileMenuOpen = false">
            خانه
          </router-link>

          <router-link to="/about"
            class="block rounded-md px-3 py-2 text-base font-medium hover:bg-white/20 transition-colors duration-200"
            @click="mobileMenuOpen = false">
            درباره ما
          </router-link>

          <template v-if="isUserLoggedIn && userRole === 'user'">
            <router-link to="/reserve"
              class="block rounded-md px-3 py-2 text-base font-medium hover:bg-white/20 transition-colors duration-200"
              @click="mobileMenuOpen = false">
              رزرو
            </router-link>

            <router-link to="/basket"
              class="block rounded-md px-3 py-2 text-base font-medium hover:bg-white/20 transition-colors duration-200"
              @click="mobileMenuOpen = false">
              سبد
            </router-link>

            <router-link to="/my-panel"
              class="block rounded-md px-3 py-2 text-base font-medium hover:bg-white/20 transition-colors duration-200"
              @click="mobileMenuOpen = false">
              پنل کاربری
            </router-link>
          </template>

          <template v-if="isUserLoggedIn && userRole === 'admin'">
            <router-link to="/admin"
              class="block rounded-md px-3 py-2 text-base font-medium hover:bg-white/20 transition-colors duration-200"
              @click="mobileMenuOpen = false">
              پنل مدیریت
            </router-link>
          </template>

          <template v-if="!isUserLoggedIn">
            <router-link to="/login"
              class="block rounded-md px-3 py-2 text-base font-medium hover:bg-white/20 transition-colors duration-200"
              @click="mobileMenuOpen = false">
              ورود
            </router-link>

            <router-link to="/register"
              class="block rounded-md px-3 py-2 text-base font-medium hover:bg-white/20 transition-colors duration-200"
              @click="mobileMenuOpen = false">
              ثبت‌نام
            </router-link>
          </template>

          <template v-if="isUserLoggedIn">
            <button @click="logout"
              class="w-full text-left block rounded-md px-3 py-2 text-base font-medium hover:bg-red-500/20 text-red-200 transition-colors duration-200">
              خروج
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { authState, clearAuthState } from "./utils/auth";
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();
const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);
const adminMenuOpen = ref(false);
const userDropdown = ref(null);
const adminDropdown = ref(null);

// Auth state computed properties using reactive authState
const isUserLoggedIn = computed(() => !!authState.value.token);
const userRole = computed(() => authState.value.role);
const userName = computed(() => {
  if (authState.value.user) {
    try {
      const user = JSON.parse(authState.value.user);
      return `${user.firstName} ${user.lastName}`;
    } catch (e) {
      return "کاربر";
    }
  }
  return "کاربر";
});

// Logout function
function logout() {
  clearAuthState();

  // Close menus
  userMenuOpen.value = false;
  adminMenuOpen.value = false;
  mobileMenuOpen.value = false;

  // Redirect to home
  router.push("/");
}

// Close dropdowns when clicking outside
function handleClickOutside(event) {
  if (userDropdown.value && !userDropdown.value.contains(event.target)) {
    userMenuOpen.value = false;
  }
  if (adminDropdown.value && !adminDropdown.value.contains(event.target)) {
    adminMenuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

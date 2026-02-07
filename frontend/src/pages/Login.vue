<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo Section -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">
          RentShot
        </h1>
      </div>

      <!-- Login Card -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
        <!-- Tab Buttons -->
        <div class="flex mb-8 bg-gray-100 rounded-xl p-1">
          <button :class="[
            'flex-1 py-3 px-4 text-sm font-medium rounded-lg',
            mode === 'user'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600',
          ]" @click="mode = 'user'">
            کاربر
          </button>
          <button :class="[
            'flex-1 py-3 px-4 text-sm font-medium rounded-lg',
            mode === 'admin'
              ? 'bg-green-600 text-white'
              : 'text-gray-600',
          ]" @click="mode = 'admin'">
            مدیر
          </button>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="submit" class="space-y-6">
          <!-- User Login Fields -->
          <div v-if="mode === 'user'" class="space-y-4">
            <div class="relative">
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              </div>
              <input v-model="identifier" type="text" placeholder="کد ملی یا کد شخصی"
                class="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                required />
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              </div>
              <input v-model="password" type="password" placeholder="رمز عبور"
                class="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                required />
            </div>
          </div>

          <!-- Admin Login Fields -->
          <div v-else class="space-y-4">
            <div class="relative">
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              </div>
              <input v-model="username" type="text" placeholder="نام کاربری"
                class="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                required />
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              </div>
              <input v-model="password" type="password" placeholder="رمز عبور"
                class="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                required />
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="loading"
            class="w-full py-4 bg-blue-500  text-white font-bold rounded-xl hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg">
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none">
                </circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              در حال ورود...
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              ورود به سیستم
            </span>
          </button>
        </form>

        <!-- Error Message -->
        <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div class="flex items-center gap-2">
            <p class="text-red-700 font-medium">{{ error }}</p>
          </div>
        </div>

        <!-- Register Link -->
        <div class="mt-8 text-center">
          <p class="text-gray-600">
            حساب کاربری ندارید؟
            <router-link to="/register"
              class="text-orange-600 hover:text-orange-700 font-medium transition-all duration-200">
              ثبت نام کنید
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login, loginAdmin } from "../services/auth";
import { setAuthState } from "../utils/auth";

const mode = ref("user");
const identifier = ref("");
const username = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const router = useRouter();

async function submit() {
  try {
    loading.value = true;
    error.value = "";

    if (mode.value === "user") {
      const { data } = await login(identifier.value, password.value);
      setAuthState(data.token, "user", data.user);
      router.push("/reserve");
    } else {
      const { data } = await loginAdmin(username.value, password.value);
      setAuthState(data.token, "admin");
      router.push("/admin");
    }
  } catch (e) {
    console.error("Login error:", e);
    error.value = e.response?.data?.error || "خطا در ورود به سیستم";
  } finally {
    loading.value = false;
  }
}
</script>

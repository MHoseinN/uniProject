<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">
          پنل کاربری
        </h1>
        <p class="text-gray-600">
          {{ user?.firstName }} {{ user?.lastName }} خوش آمدید
        </p>
      </div>

      <!-- Registration Success Message -->
      <div v-if="registrationSuccess" class="mb-8 mx-auto max-w-md">
        <div class="bg-green-50 border border-green-200 rounded-xl p-6 shadow-lg">
          <div class="flex items-center gap-3">
            <div>
              <h3 class="text-lg font-bold text-green-800 mb-1">
                ثبت نام موفق!
              </h3>
            </div>
            <button @click="dismissRegistrationMessage" class="ml-auto text-green-600 p-2">
              -
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- User info -->
        <div class="lg:col-span-1">
          <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 gap-2">
              اطلاعات کاربری
            </h2>

            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span class="font-bold">{{
                  user.firstName
                  }}</span>
                <span class="text-gray-600">نام:</span>
              </div>

              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span class="font-bold">{{ user.lastName }}</span>
                <span class="text-gray-600">نام خانوادگی:</span>
              </div>

              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span class="font-bold">{{
                  user.myCode || "در انتظار تایید"
                  }}</span>
                <span class="text-gray-600">کد شخصی:</span>
              </div>

              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span class="font-bold">{{ user.phone }}</span>
                <span class="text-gray-600">شماره تلفن:</span>
              </div>
            </div>

          </div>

          <!-- Messages -->
          <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 gap-2">
              پیام‌ها
            </h2>

            <div v-if="messages.length === 0" class="text-center py-8">
              <p class="text-gray-500">پیامی موجود نیست</p>
            </div>

            <div v-else class="space-y-3 max-h-96 overflow-y-auto">
              <div v-for="m in messages" :key="m._id || m.createdAt"
                class="p-4 bg-green-50 rounded-lg border border-blue-100">
                <p class="text-gray-800 mb-2">{{ m.text }}</p>
                <div class="text-sm text-gray-500 flex items-center gap-1">
                  {{ new Date(m.createdAt).toLocaleString("fa-IR") }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reservations -->
        <div class="lg:col-span-2">
          <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 gap-2">
              رزروهای من
            </h2>

            <div v-if="loading" class="flex justify-center items-center py-16">
              <div class="flex flex-col items-center">
                <svg class="animate-spin h-12 w-12 text-blue-600 mb-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none">
                  </circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                <p class="text-lg font-medium text-gray-700">
                  در حال بارگذاری رزروها...
                </p>
              </div>
            </div>

            <div v-else-if="reservations.length === 0" class="text-center py-16">
              <h3 class="text-2xl font-bold text-gray-600 mb-2">
                هنوز رزروی ندارید
              </h3>
              
              <router-link to="/reserve"
                class="inline-flex items-center gap-2 bg-blue-500 text-white font-bold py-3 px-6 rounded-xl">
                شروع اجاره
              </router-link>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-blue-600 text-white">
                  <tr>
                    <th class="px-4 py-3 text-right text-sm font-bold">
                      کد رزور
                    </th>
                    <th class="px-4 py-3 text-right text-sm font-bold">
                      تاریخ شروع
                    </th>
                    <th class="px-4 py-3 text-right text-sm font-bold">
                      تاریخ پایان
                    </th>
                    <th class="px-4 py-3 text-right text-sm font-bold">
                      قیمت کل
                    </th>
                    <th class="px-4 py-3 text-right text-sm font-bold">
                      ساعات تاخیر
                    </th>
                    <th class="px-4 py-3 text-right text-sm font-bold">
                      قیمت نهایی
                    </th>
                    <th class="px-4 py-3 text-center text-sm font-bold">
                      وضعیت
                    </th>
                    <th class="px-4 py-3 text-center text-sm font-bold">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="r in reservations" :key="r.trackingCode">
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                        #{{ r.trackingCode }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-600">
                      {{ new Date(r.startDate).toLocaleDateString("fa-IR") }}
                    </td>
                    <td class="px-4 py-3 text-gray-600">
                      {{ new Date(r.endDate).toLocaleDateString("fa-IR") }}
                    </td>
                    <td class="px-4 py-3">
                      <span class="font-bold text-black">
                        {{ r.totalPrice?.toLocaleString() }} تومان
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'font-bold',
                        r.lateHours > 0 ? 'text-red-600' : 'text-gray-600',
                      ]">
                        {{ r.lateHours || 0 }} ساعت
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="font-bold text-green-600">
                        {{
                          r.finalPrice?.toLocaleString() ||
                          r.totalPrice?.toLocaleString()
                        }}
                        تومان
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex flex-col gap-1">
                        <span :class="[
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          r.received
                            ? 'bg-green-100'
                            : 'bg-gray-100',
                        ]">
                          {{
                            r.received ? " دریافت شده" : " در انتظار دریافت"
                          }}
                        </span>
                        <span :class="[
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          r.returned
                            ? 'bg-green-100 '
                            : 'bg-gray-100',
                        ]">
                          {{
                            r.returned ? " برگشت داده شده" : " در دست کاربر"
                          }}
                        </span>
                        <span :class="[
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          r.paid
                            ? 'bg-green-100'
                            : 'bg-gray-100',
                        ]">
                          {{ r.paid ? " پرداخت شده" : " پرداخت نشده" }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <router-link :to="`/factor/${r.trackingCode}`"
                        class="text-black font-bold py-2 px-4 bg-orange-200 hover:bg-orange-400 transition-all duration-100 rounded-lg text-sm">
                        فاکتور
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getMyReservations } from "../services/reservation";
import { getMessages } from "../services/message";
import { getMe } from "../services/auth";

const reservations = ref([]);
const messages = ref([]);
const loading = ref(true);
const user = ref({});
const router = useRouter();
const registrationSuccess = ref(false);


onMounted(async () => {
  // Check for registration success message
  if (localStorage.getItem("registrationSuccess") === "true") {
    registrationSuccess.value = true;

  }

  user.value = (await getMe()).data.user;

  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  try {
    loading.value = true;

    // Load reservations
    try {
      const reservationData = await getMyReservations(token);
      reservations.value = reservationData?.data || reservationData || [];
    } catch (error) {
      console.error("Error loading reservations:", error);
      reservations.value = [];
    }

    // Load messages
    try {
      const { data: msg } = await getMessages(token);
      messages.value = msg || [];
    } catch (error) {
      console.error("Error loading messages:", error);
      messages.value = [];
    }
  } catch (error) {
    console.error("Error loading panel data:", error);
  } finally {
    loading.value = false;
  }
});

function dismissRegistrationMessage() {
  registrationSuccess.value = false;
  localStorage.removeItem("registrationSuccess");
}
</script>

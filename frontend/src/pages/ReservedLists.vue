<template>
  <div
    class="min-h-screen py-8 px-4"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1
          class="text-4xl font-bold mt-10 mb-2"
        >
          مدیریت رزروها
        </h1>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-12 text-center"
      >
        <div class="flex flex-col items-center">
          <svg
            class="animate-spin h-12 w-12 text-purple-600 mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-lg font-medium text-gray-700">
            در حال بارگذاری رزروها...
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8"
      >
        <div class="bg-red-50 border border-red-200 rounded-xl p-6">
          <div class="flex items-center gap-3">
            <div>
              <h3 class="text-lg font-bold text-red-800">خطا در بارگذاری</h3>
              <p class="text-red-700">{{ error }}</p>
            </div>
          </div>
          <button
            @click="load"
            class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            تلاش مجدد
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="reservations.length === 0"
        class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-12 text-center"
      >
        <h3 class="text-2xl font-bold text-gray-600 mb-2">
          هیچ رزروی یافت نشد
        </h3>
      </div>

      <!-- Reservations Table -->
      <div
        v-else
        class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead
              class="bg-blue-500 text-white"
            >
              <tr>
                <th
                  class="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider"
                >
                  کد رزرو
                </th>
                <th
                  class="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider"
                >
                  نام کاربر
                </th>
                <th
                  class="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider"
                >
                  تاریخ شروع
                </th>
                <th
                  class="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider"
                >
                  تاریخ پایان
                </th>
                <th
                  class="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider"
                >
                  دریافت شده
                </th>
                <th
                  class="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider"
                >
                  برگشت داده شده
                </th>
                <th
                  class="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider"
                >
                  پرداخت شده
                </th>
                <th
                  class="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider"
                >
                  ساعات تاخیر
                </th>
                <th
                  class="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider"
                >
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="r in reservations"
                :key="r.trackingCode"
                class="hover:bg-blue-50 transition-colors duration-200"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    >
                      #{{ r.trackingCode }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ r.user?.firstName }} {{ r.user?.lastName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600">
                    {{ formatDate(r.startDate) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600">
                    {{ formatDate(r.endDate) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex justify-center">
                    <label
                      class="relative inline-flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        v-model="r.received"
                        class="sr-only peer"
                      />
                      <div
                        class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                      ></div>
                    </label>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex justify-center">
                    <label
                      :class="[
                        'relative inline-flex items-center',
                        r.received
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed opacity-50',
                      ]"
                    >
                      <input
                        type="checkbox"
                        v-model="r.returned"
                        :disabled="!r.received"
                        class="sr-only peer"
                      />
                      <div
                        :class="[
                          'w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all',
                          r.received
                            ? 'peer-checked:bg-green-600'
                            : 'peer-checked:bg-gray-400',
                        ]"
                      ></div>
                    </label>
                  </div>
                  <div v-if="!r.received" class="text-xs text-gray-500 mt-1">
                    ابتدا دریافت را تایید کنید
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex justify-center">
                    <label
                      :class="[
                        'relative inline-flex items-center',
                        r.received
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed opacity-50',
                      ]"
                    >
                      <input
                        type="checkbox"
                        v-model="r.paid"
                        :disabled="!r.received"
                        class="sr-only peer"
                      />
                      <div
                        :class="[
                          'w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all',
                          r.received
                            ? 'peer-checked:bg-green-600'
                            : 'peer-checked:bg-gray-400',
                        ]"
                      ></div>
                    </label>
                  </div>
                  <div v-if="!r.received" class="text-xs text-gray-500 mt-1">
                    ابتدا دریافت را تایید کنید
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="number"
                    v-model.number="r.lateHours"
                    min="0"
                    class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    @click="save(r)"
                    :disabled="saving"
                    class="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600  transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span v-if="saving" class="flex items-center gap-2">
                      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                          fill="none"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      ذخیره...
                    </span>
                    <span v-else class="flex items-center gap-2">
                      ذخیره
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getReservations,
  updateReservation,
  testConnection,
} from "../services/admin";

const reservations = ref([]);
const loading = ref(false);
const error = ref(null);
const saving = ref(false);

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("fa-IR",
   { year: "numeric", month: "2-digit", day: "2-digit" });

}

async function load() {
  try {
    loading.value = true;
    error.value = null;
    // console.log("API connection successful");

    const { data } = await getReservations();
    reservations.value = data;
    console.log("Loaded reservations:", data);

    // Check if user token exists
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Token payload:", payload);
      } catch (e) {
        console.log("Could not decode token");
      }
    }
  } catch (err) {
    console.error("Error loading reservations:", err);
    error.value = err.message || "Failed to load reservations";
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
      error.value = `Error ${err.response.status}: ${
        err.response.data?.error ||
        err.response.data?.message ||
        "Unknown error"
      }`;
    }
  } finally {
    loading.value = false;
  }
}

async function save(r) {
  try {
    saving.value = true;
    console.log("Saving reservation:", r.trackingCode);

    // Validation before sending request
    if ((r.returned && !r.received) || (r.paid && !r.received)) {
      alert("ابتدا باید وضعیت دریافت را تایید کنید");
      return;
    }

    const response = await updateReservation(r.trackingCode, {
      received: r.received,
      returned: r.returned,
      paid: r.paid,
      lateHours: r.lateHours,
    });

    // Show success message if any messages were sent
    if (
      response.messagesSent &&
      response.messagesSent !== "هیچ پیامی ارسال نشد"
    ) {
      alert(` تغییرات ذخیره شد. ${response.messagesSent}`);
    }

    await load();
    console.log("Reservation saved successfully");
  } catch (err) {
    console.error("Error saving reservation:", err);

    // Show specific validation errors
    if (err.response?.status === 400) {
      alert(` ${err.response.data.error}`);
    } else {
      alert(" خطا در ذخیره تغییرات");
    }

    // Reload to reset any invalid changes
    await load();
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

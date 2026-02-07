<template>
  <div class="min-h-screen p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-12 w-12 text-purple-600 mb-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none">
            </circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <p class="text-lg font-medium text-gray-700">
            در حال بارگذاری فاکتور...
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error"
        class="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div class="p-16 text-center">
          <div class="text-6xl mb-4">❌</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">فاکتور یافت نشد</h2>
          <p class="text-gray-600 mb-8">
            فاکتور با کد پیگیری {{ code }} پیدا نشد.
          </p>
          <button @click="back"
            class="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mx-auto">
            <span></span>
            بازگشت به پنل
          </button>
        </div>
      </div>

      <!-- Invoice Content -->
      <div v-else-if="reservation"
        class="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <!-- Invoice Header -->
        <div class="bg-blue-600 text-white p-8">
          <div class="text-center">
            <h1 class="text-3xl md:text-4xl font-bold mb-2"> فاکتور خرید</h1>
          </div>
        </div>

        <!-- Invoice Details -->
        <div class="p-8">
          <!-- Tracking Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-blue-50 rounded-xl p-6 text-center">
              <div class="text-sm text-gray-600 mb-1">کد رزرو</div>
              <div class="text-xl font-bold">
                {{ reservation.trackingCode || code }}
              </div>
            </div>

            <div class="bg-blue-50 rounded-xl p-6 text-center">
              <div class="text-sm text-gray-600 mb-1">تاریخ شروع</div>
              <div class="text-lg font-semibold">
                {{ formatDate(reservation.startDate) }}
              </div>
            </div>

            <div class="bg-blue-50 rounded-xl p-6 text-center">
              <div class="text-sm text-gray-600 mb-1">تاریخ پایان</div>
              <div class="text-lg font-semibold">
                {{ formatDate(reservation.endDate) }}
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="mb-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 gap-3">
              اقلام سفارش
            </h3>

            <div class="bg-blue-100 rounded-xl overflow-hidden shadow-inner">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-blue-600 text-white">
                    <tr>
                      <th class="px-6 py-4 text-right text-sm font-bold border-r">
                        ردیف
                      </th>
                      <th class="px-6 py-4 text-right text-sm font-bold border-r">
                        نام کالا
                      </th>
                      <th class="px-6 py-4 text-center text-sm font-bold border-r">
                        قیمت واحد
                      </th>
                      <th class="px-6 py-4 text-center text-sm font-bold border-r">
                        تعداد
                      </th>
                      <th class="px-6 py-4 text-center text-sm font-bold border-r">
                        مجموع قیمت
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="(item, index) in reservation.items || []" :key="item.productId"
                      class="hover:bg-white/50 transition-colors duration-200"
                      :class="index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/50'">
                      <td class="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                        {{ index + 1 }}
                      </td>
                      <td class="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                        <div class="flex items-center gap-2">
                          {{ item.name || "نامشخص" }}
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-center border-r border-gray-200">
                        <span class="inline-flex items-center px-3 py-1 rounded-full font-semibold">
                          {{ (item.unitPrice || 0).toLocaleString() }} تومان
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-center border-r border-gray-200">
                        <span class="inline-flex items-center px-3 py-1 rounded-full font-semibold">
                          {{ item.count || 0 }} عدد
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-center">
                        <span class="inline-flex items-center px-3 py-1 rounded-full font-bold">
                          {{
                            (
                              (item.unitPrice || 0) * (item.count || 0)
                            ).toLocaleString()
                          }}
                          تومان
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-200">
                    <tr>
                      <td colspan="4"
                        class="px-6 py-4 text-lg font-bold text-gray-800 text-left border-r border-gray-300">
                        جمع کل اقلام:
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span
                          class="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500 text-white font-bold text-lg">
                          {{ calculateItemsTotal().toLocaleString() }} تومان
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Price Summary -->
          <div class="bg-blue-50 rounded-xl p-6 mb-8">
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <span class="text-lg font-semibold">{{
                  (reservation.totalPrice || 0).toLocaleString()
                }}
                  تومان</span>
                <span class="text-gray-600">مجموع قیمت:</span>
              </div>

              <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <span class="text-lg font-semibold" :class="penalty > 0 ? 'text-red-600' : 'text-green-600'">
                  {{ penalty.toLocaleString() }} تومان
                </span>
                <span class="text-gray-600">جریمه دیرکرد:</span>
              </div>

              <div class="flex justify-between items-center py-3 bg-white rounded-lg px-4">
                <span class="text-2xl font-bold text-black">{{
                  (reservation.finalPrice || 0).toLocaleString()
                }}
                  تومان</span>
                <span class="text-xl font-bold text-gray-800">مبلغ نهایی:</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button @click="back"
              class="bg-blue-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2">
              بازگشت به پنل
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getMyReservations } from "../services/reservation";

const route = useRoute();
const router = useRouter();
const reservation = ref(null);
const loading = ref(true);
const error = ref(false);

const code = parseInt(route.params.code);

async function load() {
  try {
    loading.value = true;
    error.value = false;
    const token = localStorage.getItem("token");
    const data = await getMyReservations(token);
    const foundReservation = data.find((r) => r.trackingCode === code);

    if (!foundReservation) {
      console.error("Reservation not found");
      error.value = true;
      return;
    }

    reservation.value = foundReservation;
  } catch (err) {
    console.error("Error loading reservation:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

const penalty = computed(() => {
  if (!reservation.value) return 0;
  const total = reservation.value.totalPrice || 0;
  const final = reservation.value.finalPrice || total;
  return Math.max(0, final - total);
});

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
   
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    return dateString.slice(0, 10);
  }
}

function print() {
  window.print();
}

function back() {
  router.push("/my-panel");
}

function calculateItemsTotal() {
  if (!reservation.value?.items) return 0;
  return reservation.value.items.reduce((sum, item) => {
    return sum + (item.unitPrice || 0) * (item.count || 0);
  }, 0);
}
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mt-10 mb-8">
        <h1 class="text-4xl font-bold mb-2">
          سبد رزرو
        </h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
          <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 gap-2">
              آیتم‌های انتخابی
            </h2>

            <div v-if="cart.length === 0" class="text-center py-12">
              <h3 class="text-xl font-bold text-gray-600 mb-2">
                سبد خرید خالی است
              </h3>
              <p class="text-gray-500 mb-6">هنوز محصولی انتخاب نکرده‌اید</p>
              <router-link to="/reserve"
                class="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all duration-300 transform">
                رفتن به فروشگاه
              </router-link>
            </div>

            <div v-else class="space-y-4">
              <div v-for="item in cart" :key="item.productId" class="bg-blue-50 rounded-xl p-4 border">
                <div class="flex gap-4">
                  <!-- Content -->
                  <div class="flex-1 flex flex-col gap-4">
                    <!-- Header with name and remove button -->
                    <div class="flex justify-between items-start">
                      <h3 class="font-bold text-gray-800 text-lg">
                        {{ item.name }}
                      </h3>
                      <button @click="removeFromCart(item.productId)"
                        class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                        title="حذف از سبد">حذف -
                      </button>
                    </div>

                    <!-- Quantity controls and price -->
                    <div class="flex justify-between items-center">
                      <div class="flex items-center gap-4">
                        <!-- Quantity Controls -->
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-gray-600"> تعداد</span>
                          <div class="flex items-center bg-white rounded-lg border border-gray-200">
                            <button @click="decreaseQuantity(item.productId)" :disabled="item.count <= 1"
                              class="px-3 py-1 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors">-
                            </button>
                            <span class="px-3 py-1 font-bold min-w-[40px] text-center">
                              {{ item.count }}
                            </span>
                            <button @click="increaseQuantity(item.productId)"
                              class="px-3 py-1 hover:bg-blue-50 rounded-l-lg transition-colors">
                              +
                            </button>
                          </div>
                        </div>

                        <!-- Unit Price -->
                        <span class="flex items-center gap-1 text-sm text-gray-600">
                          قیمت واحد:
                          <span class="font-bold">{{
                            item.unitPrice.toLocaleString()
                            }}</span>
                          تومان
                        </span>
                      </div>

                      <!-- Total Price -->
                      <div class="text-left">
                        <div class="text-2xl font-bold text-green-600">
                          {{ (item.unitPrice * item.count).toLocaleString() }}
                        </div>
                        <div class="text-sm text-gray-500">تومان</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 sticky top-8">
            <!-- Date Selection -->
            <div class="mb-8">
              <h3 class="text-xl font-bold text-gray-800 mb-4 gap-2"> انتخاب تاریخ</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">تاریخ شروع </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
                    </div>
                    <flat-pickr v-model="startDate" :config="dateConfig"
                      class="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-blue-20 focus:from-white focus:to-blue-50 text-gray-700 font-medium shadow-sm "
                      placeholder=" تاریخ شروع" />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">تاریخ پایان</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
                    </div>
                    <flat-pickr v-model="endDate" :config="endDateConfig"
                      class="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-blue-20 focus:from-white focus:to-blue-50 text-gray-700 font-medium shadow-sm"
                      placeholder=" تاریخ پایان" />
                  </div>
                </div>
              </div>

              <!-- Date Info -->
              <div v-if="datesValid" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div class="gap-2 text-green-700">
                  <span class="font-medium">مدت رزرو: {{ rentalDays }} روز</span>
                </div>
              </div>
            </div>

            <!-- Price Summary -->
            <div class="border-t border-gray-200 pt-6 mb-6">
              <h3 class="text-xl font-bold text-gray-800 mb-4 gap-2">خلاصه هزینه
              </h3>

              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="font-bold">{{ basePrice.toLocaleString() }} تومان</span>
                  <span class="text-gray-600">قیمت کل محصولات:</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-bold">{{ rentalDays }} روز</span>
                  <span class="text-gray-600">تعداد روز:</span>
                </div>
                <div class="border-t border-gray-200 pt-3">
                  <div class="flex justify-between items-center">
                    <div class="text-left">
                      <div class="text-2xl font-bold text-green-600">
                        {{ totalPrice.toLocaleString() }}
                        <div class="text-sm text-gray-500">تومان</div>
                      </div>
                    </div>
                    <span class="text-lg font-bold text-gray-800">جمع کل:</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Confirm Button -->
            <button @click="confirmReservation" :disabled="!datesValid || cart.length === 0 || loading"
              class="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg">
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none">
                  </circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                در حال ثبت...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                تایید نهایی رزرو
              </span>
            </button>

            <!-- Message -->
            <div v-if="message" :class="[
              'mt-4 p-4 rounded-xl border',
              message.includes('موفقیت')
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700',
            ]">
              <div class="flex items-center gap-2">
                <span>{{ message.includes("موفقیت") ? "موفق" : "نا موفق" }}</span>
                <p class="font-medium">{{ message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { createReservation } from "../services/reservation";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { Persian } from "flatpickr/dist/l10n/fa.js";
import { getProducts } from "../services/product";

const components = {
  flatPickr,
};

const cart = ref(JSON.parse(localStorage.getItem("cart") || "[]"));
const startDate = ref("");
const endDate = ref("");
const message = ref("");
const loading = ref(false);
const router = useRouter();

// Flatpickr configuration
const dateConfig = {
  dateFormat: "Y-m-d",
  locale: Persian,
  minDate: "today",
  time_24hr: true,
  minuteIncrement: 30,
};

const endDateConfig = computed(() => ({
  dateFormat: "Y-m-d",
  locale: Persian,
  minDate: startDate.value || "today",
  time_24hr: true,
  minuteIncrement: 30,
}));

const datesValid = computed(() => {
  return (
    startDate.value &&
    endDate.value &&
    new Date(startDate.value) <= new Date(endDate.value)
  );
});

const rentalDays = computed(() => {
  if (!datesValid.value) return 0;
  return Math.max(
    1,
    Math.ceil(
      (new Date(endDate.value) - new Date(startDate.value)) /
      (1000 * 60 * 60 * 24)
    ) + 1
  );
});

const basePrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.unitPrice * item.count, 0);
});

const totalPrice = computed(() => {
  if (!datesValid.value) return 0;
  return basePrice.value * rentalDays.value;
});

async function confirmReservation() {
  if (!datesValid.value) return;

  try {
    loading.value = true;
    message.value = "";

    const token = localStorage.getItem("token");
    await createReservation(
      {
        items: cart.value,
        startDate: startDate.value,
        endDate: endDate.value,
      },
      token
    );

    localStorage.removeItem("cart");
    message.value = "رزرو شما با موفقیت ثبت شد.";

    setTimeout(() => {
      router.push("/my-panel");
    }, 2000);
  } catch (err) {
    console.error("Reservation error:", err);
    message.value = err.response?.data?.error || "ثبت رزرو با شکست مواجه شد.";
  } finally {
    loading.value = false;
  }
}

function increaseQuantity(productId) {
  const item = cart.value.find((item) => item.productId === productId);
  if (item.count < 4) {
    item.count++;
    updateCart();
  }
  else {
    alert("error");
  }
}

function decreaseQuantity(productId) {
  const item = cart.value.find((item) => item.productId === productId);
  if (item && item.count > 1) {
    item.count--;
    updateCart();
  }
}

function removeFromCart(productId) {
  const index = cart.value.findIndex((item) => item.productId === productId);
  if (index !== -1) {
    cart.value.splice(index, 1);
    updateCart();
  }
}

function updateCart() {
  localStorage.setItem("cart", JSON.stringify(cart.value));
}

</script>

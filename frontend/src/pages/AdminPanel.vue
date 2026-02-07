<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-4"> پنل مدیریت </h1>
      </div>

      <!-- Admin Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Products Management -->
        <router-link to="/admin/products" class="group">
          <div
            class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-3xl">
            <div class="flex flex-col items-center text-center">
              <h3 class="text-2xl font-bold text-gray-800 mb-3"> مدیریت محصولات </h3>
              <p class="text-gray-600 text-center">
                افزودن، ویرایش و حذف محصولات
              </p>
              <div class="mt-4 inline-flex items-center text-orange-600 font-semibold"> مدیریت محصولات
              </div>
            </div>
          </div>
        </router-link>

        <!-- Pending Users -->
        <router-link to="/admin/queue-users" class="group">
          <div
            class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-3xl">
            <div class="flex flex-col items-center text-center">
              <h3 class="text-2xl font-bold text-gray-800 mb-3">
                کاربران در انتظار
              </h3>
              <p class="text-gray-600 text-center">تایید یا رد کاربران جدید</p>
              <div class="mt-4 inline-flex items-center text-orange-600 font-semibold "> مشاهده درخواست‌ها
              </div>
            </div>
          </div>
        </router-link>

        <!-- Registered Users -->
        <router-link to="/admin/registered-users" class="group">
          <div
            class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-3xl">
            <div class="flex flex-col items-center text-center">
              <h3 class="text-2xl font-bold text-gray-800 mb-3">
                کاربران تایید شده
              </h3>
              <p class="text-gray-600 text-center">مدیریت کاربران فعال سیستم</p>
              <div class="mt-4 inline-flex items-center text-orange-600 font-semibold"> مشاهده کاربران
              </div>
            </div>
          </div>
        </router-link>

        <!-- Reservations -->
        <router-link to="/admin/reserved-lists" class="group">
          <div
            class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-3xl">
            <div class="flex flex-col items-center text-center">
              <h3 class="text-2xl font-bold text-gray-800 mb-3">
                مدیریت رزروها
              </h3>
              <p class="text-gray-600 text-center">
                مشاهده و مدیریت رزروهای کاربران
              </p>
              <div class="mt-4 inline-flex items-center text-orange-600 font-semibold"> مشاهده رزروها
              </div>
            </div>
          </div>
        </router-link>

        <!-- Income -->
        <router-link to="/admin/income" class="group">
          <div
            class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-3xl">
            <div class="flex flex-col items-center text-center">
              <h3 class="text-2xl font-bold text-gray-800 mb-3">گزارش درآمد</h3>
              <p class="text-gray-600 text-center">مشاهده آمار و گزارش مالی</p>
              <div class="mt-4 inline-flex items-center text-orange-600 font-semibold "> مشاهده گزارش
              </div>
            </div>
          </div>
        </router-link>

      </div>
    </div>
  </div>
</template>

<script setup>
</script>

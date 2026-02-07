<template>
  <div class="min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mt-10 mb-4">
          مدیریت محصولات
        </h1>
      </div>

      <!-- Add Product Form -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 mb-8 border border-white/20">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 gap-3">
          افزودن محصول جدید
        </h2>

        <form @submit.prevent="create" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">نام محصول</label>
            <input v-model="form.name" type="text" placeholder="نام محصول را وارد کنید" required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">قیمت </label>
            <input v-model.number="form.price" type="number" placeholder="قیمت به تومان" required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">موجودی</label>
            <input v-model.number="form.quantity" type="number" placeholder="تعداد موجودی" required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">دسته‌بندی</label>
            <input v-model="form.category" type="text" placeholder="دسته‌بندی محصول" required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" />
          </div>

          <div class="flex items-end">
            <button type="submit" :disabled="loading"
              class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {{ loading ? "در حال افزودن..." : "افزودن محصول" }}
            </button>
          </div>
        </form>
      </div>

      <!-- Products List -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-800 gap-3">
            لیست محصولات
            <span class="bg-blue-100 px-3 py-1 rounded-full text-sm font-medium">
              {{ products.length }} محصول
            </span>
          </h2>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-16">
          <div class="flex flex-col items-center">
            <svg class="animate-spin h-12 w-12 text-orange-600 mb-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none">
              </circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            <p class="text-lg font-medium text-gray-700">
              در حال بارگذاری محصولات...
            </p>
          </div>
        </div>

        <!-- Products Table -->
        <div v-else-if="products.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  شناسه
                </th>
                <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  نام محصول
                </th>
                <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  قیمت
                </th>
                <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  موجودی
                </th>
                <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">
                  دسته‌بندی
                </th>
                <th class="px-24 py-4 text-left text-sm font-medium text-gray-500">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="p in products" :key="p.productId" class="hover:bg-gray-50 transition-colors duration-200">
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ p.productId }}
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                  {{ p.name }}
                </td>
                <td class="px-6 py-4">
                  <input type="number" v-model.number="p.price"
                    class="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </td>
                <td class="px-6 py-4">
                  <input type="number" v-model.number="p.quantity"
                    class="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </td>
                <td class="px-6 py-4">
                  <span class="inline-block text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {{ p.category }}
                  </span>
                </td>
                <td class="px-14 py-4">
                  <div class="flex gap-2">
                    <button @click="save(p)"
                      class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium flex items-center gap-1">
                      ذخیره
                    </button>
                    <button @click="remove(p.productId)"
                      class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium flex items-center gap-1">
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <h3 class="text-2xl font-bold text-gray-600 mb-2">
            محصولی موجود نیست
          </h3>
          <p class="text-gray-500">محصول جدیدی اضافه کنید</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/admin";

const products = ref([]);
const loading = ref(true);
const form = ref({
  name: "",
  price: 0,
  quantity: 0,
  category: "",
});

async function load() {
  try {
    loading.value = true;
    const { data } = await getProducts();
    products.value = data;
  } catch (error) {
    console.error("Error loading products:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(load);


async function create() {
  try {
    loading.value = true;
    await createProduct(form.value);
    form.value = {
      name: "",
      price: 0,
      quantity: 0,
      category: "",
    };
    await load();
  } catch (error) {
    console.error("Error creating product:", error);
  } finally {
    loading.value = false;
  }
}

async function save(p) {
  try {
    await updateProduct(p.productId, { price: p.price, quantity: p.quantity });
    await load();
  } catch (error) {
    console.error("Error updating product:", error);
  }
}

async function remove(id) {
  try {
    if (confirm("آیا از حذف این محصول مطمئن هستید؟")) {
      await deleteProduct(id);
      await load();
    }
  } catch (error) {
    console.error("Error deleting product:", error);
  }
}
</script>

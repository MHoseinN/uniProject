<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Welcome Section -->
      <div class="text-center mb-16 mt-10">
        <h2 class="text-4xl md:text-5xl font-bold mb-6">
          به RentShot خوش آمدید
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          بهترین پلتفرم اجاره محصولات در ایران. هر چیزی که نیاز دارید را با قیمت
          مناسب اجاره کنید
        </p>
      </div>

      <!-- Category Filter -->
      <div class="mb-16">
        <h3 class="text-3xl font-bold text-center text-gray-800 mb-8">
          دسته‌بندی محصولات
        </h3>
        <div class="flex flex-wrap justify-center gap-4">
          <button v-for="cat in categories" :key="cat" :class="[
            'px-6 py-3 rounded-full font-medium',
            cat === selectedCategory
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 border-2',
          ]" @click="filterProducts(cat)">
            {{ cat === "all" ? "همه محصولات" : cat }}
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="mb-16">
        <h3 class="text-3xl font-bold text-center text-gray-800 mb-8">
          <span v-if="selectedCategory === 'all'"> همه محصولات </span>
          <span v-else> محصولات {{ selectedCategory }}</span>
        </h3>

        <!-- Loading State -->
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
              در حال بارگذاری محصولات...
            </p>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-else-if="filteredProducts.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div v-for="p in filteredProducts.slice(0, 8)" :key="p.productId"
            class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white/20 group">
            <!-- Product Image -->
            <div class="h-48 overflow-hidden">
              <div class="h-full bg-green-400 flex flex-col items-end justify-center">
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-2">
                {{ p.name }}
              </h3>
              <div class="flex justify-between items-center mb-4">
                <div>
                  <div class="text-2xl font-bold text-green-600">
                    {{ p.price.toLocaleString() }}
                  </div>
                  <div class="text-sm text-gray-500">تومان </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-600">موجودی:</div>
                  <div :class="[
                    'text-lg font-bold',
                    p.quantity < 2 ? 'text-red-500' : 'text-green-600',
                  ]">
                    {{ p.quantity }}
                  </div>
                </div>
              </div>

              <!-- Category Badge -->
              <div class="mb-4">
                <span class="inline-block text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
                  {{ p.category }}
                </span>
              </div>

              <!-- Action Button -->
              <router-link to="/reserve"
                class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2">
                رزرو محصول
              </router-link>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <h3 class="text-2xl font-bold text-gray-600 mb-2">محصولی یافت نشد</h3>
          <p class="text-gray-500">در این دسته‌بندی محصولی موجود نیست</p>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 mb-16">
        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 text-center border border-white/20">
          <div class="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">رزرو سریع</h3>
          <p class="text-gray-600">فرآیند رزرو در کمتر از 5 دقیقه</p>
        </div>

        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 text-center border border-white/20">
          <div class="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">تضمین کیفیت</h3>
          <p class="text-gray-600">همه محصولات تست شده و باکیفیت</p>
        </div>

        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 text-center border border-white/20">
          <div class="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">قیمت مناسب</h3>
          <p class="text-gray-600">بهترین قیمت‌ها در بازار</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getProducts } from "../services/product";

const products = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await getProducts();
    products.value = data;
  } catch (error) {
    console.error("Error loading products:", error);
  } finally {
    loading.value = false;
  }
});

// Categories & filtering
const selectedCategory = ref("all");

const categories = computed(() => {
  const cats = new Set(products.value.map((p) => p.category));
  return ["all", ...Array.from(cats)];
});

const filteredProducts = computed(() => {
  if (selectedCategory.value === "all") return products.value;
  return products.value.filter((p) => p.category === selectedCategory.value);
});

function filterProducts(cat) {
  selectedCategory.value = cat;
}

</script>

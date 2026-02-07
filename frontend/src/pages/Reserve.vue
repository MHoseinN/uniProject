<template>
  <div class="min-h-screen mt-10 mb-6">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Category Filter -->
      <div class="mb-12">
        <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">
          دسته‌بندی محصولات
        </h1>
        <div class="flex flex-wrap justify-center gap-3">
          <button :class="[
            'px-6 py-3 rounded-full font-medium transition-all duration-300',
            selectedCategory === null
              ? 'bg-orange-600 text-white shadow-lg'
              : 'bg-white text-gray-700',
          ]" @click="selectedCategory = null">
            همه محصولات
          </button>
          <button v-for="cat in categories" :key="cat" :class="[
            'px-6 py-3 rounded-full font-medium transition-all duration-300',
            selectedCategory === cat
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2',
          ]" @click="selectedCategory = cat">
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div v-for="p in filtered" :key="p.productId"
          class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <!-- Product Header -->
          <div class="bg-green-400 h-48 flex flex-col  p-4 text-white">
            <h3 class="text-xl text-black font-bold mb-1">{{ p.name }}</h3>
            <span class="block bg-opacity-20 rounded-full text-sm">
              {{ p.category }}
            </span>
          </div>

          <div class="p-6">
            <!-- Price & Stock Info -->
            <div class="flex justify-between items-center mb-6">
              <div class="text-right">
                <div class="text-3xl font-bold text-green-600">
                  {{ p.price.toLocaleString() }}
                </div>
                <div class="text-sm text-gray-500">تومان</div>
              </div>
              <div class="text-left">
                <div class="text-sm text-gray-600 mb-1">موجودی:</div>
                <div :class="[
                  'text-lg font-bold',
                  p.quantity < 2 ? 'text-red-600' : 'text-green-600',
                ]">
                  {{ p.quantity }}
                </div>
              </div>
            </div>

            <!-- Quantity Selector -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">تعداد</label>
              <div class="flex items-center justify-center bg-gray-50 rounded-xl p-2">
                <button @click="dec(p)" :disabled="(counts[p.productId] || 1) <= 1"
                  class="w-10 h-10 rounded-lg bg-red-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-all duration-200">
                  −
                </button>
                <span class="mx-6 text-2xl font-bold text-gray-800 min-w-[2rem] text-center">
                  {{ counts[p.productId] || 1 }}
                </span>
                <button @click="inc(p)" :disabled="(counts[p.productId] || 1) >= p.quantity"
                  class="w-10 h-10 rounded-lg bg-blue-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-500 hover:to-green-600 transition-all duration-200">
                  +
                </button>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <button @click="add(p)" :disabled="p.quantity === 0"
              class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
              افزودن به سبد
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filtered.length === 0" class="text-center py-16">
        <h3 class="text-2xl font-bold text-gray-600 mb-2">محصولی یافت نشد</h3>
        <p class="text-gray-500">در این دسته‌بندی محصولی موجود نیست</p>
      </div>
    </div>

    <!-- Floating Cart Button -->
    <div class="fixed bottom-8 left-8 z-50">
      <button @click="goBasket"
        class="relative bg-orange-500 text-white p-4 w-40 rounded-xl shadow-2xl hover:bg-orange-600 transition-all duration-300">
        <span class="text-lg">برو به سبد رزرو </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getProducts } from "../services/product";

const products = ref([]);
const counts = ref({});
const selectedCategory = ref(null);
const router = useRouter();

onMounted(async () => {
  try {
    const { data } = await getProducts();
    products.value = data;
  } catch (error) {
    console.error("Error loading products:", error);
  }
});

const categories = computed(() => {
  const set = new Set();
  for (const p of products.value) set.add(p.category);
  return Array.from(set);
});

const filtered = computed(() => {
  if (!selectedCategory.value) return products.value;
  return products.value.filter((p) => p.category === selectedCategory.value);
});

function add(p) {
  // Check if user is logged in 
  const token = localStorage.getItem("token");
  if (!token) {
    alert("برای افزودن محصول به سبد خرید باید وارد شوید.");
    router.push("/login");
    return;
  }

  const count = counts.value[p.productId] || 1;
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find((i) => i.productId === p.productId);

  if (existing) {
    existing.count += count;
  } else {
    cart.push({
      productId: p.productId,
      name: p.name,
      unitPrice: p.price,
      count
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  counts.value[p.productId] = 1;

  alert(`${p.name} با موفقیت به سبد خرید اضافه شد!`);
}

function inc(p) {
  const c = counts.value[p.productId] || 1;
  if (c < p.quantity) counts.value[p.productId] = c + 1;
}

function dec(p) {
  const c = counts.value[p.productId] || 1;
  if (c > 1) counts.value[p.productId] = c - 1;
}

function goBasket() {
  router.push("/basket");
}

</script>


<template>
  <div class="home">
    <div class="hero">
      <h1>سیستم مدیریت پروژه دانشجویی</h1>
      <p>سامانه جامع مدیریت پروژه‌های دانشجویی از انتخاب موضوع تا دفاعیه</p>
      <div class="buttons">
        <router-link to="/login" class="btn btn-primary">ورود</router-link>
        <router-link to="/register" class="btn btn-secondary">ثبت نام</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    const role = authStore.userRole
    router.push(`/${role}/dashboard`)
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero {
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 40px;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero p {
  font-size: 20px;
  margin-bottom: 40px;
  line-height: 1.6;
}

.buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 40px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}
</style>

<template>
  <div class="dashboard">
    <nav class="navbar">
      <h1>پورتال دانشجو</h1>
      <div>
        <span>خوش آمدید، {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
        <button @click="handleLogout" class="logout-btn">خروج</button>
      </div>
    </nav>
    
    <div class="container">
      <div v-if="message.text" :class="['alert', `alert-${message.type}`]">
        {{ message.text }}
      </div>
      
      <div class="card">
        <h2>اطلاعات دانشجو</h2>
        <p v-if="studentStore.student">
          <strong>شماره دانشجویی:</strong> {{ studentStore.student.studentNumber }}
        </p>
        <p v-if="studentStore.student">
          <strong>رشته:</strong> {{ studentStore.student.major }}
        </p>
      </div>
      
      <!-- درخواست پروژه -->
      <div v-if="!studentStore.project" class="card">
        <h2>درخواست اخذ پروژه</h2>
        <p>برای شروع پروژه خود، لطفاً درخواست اخذ پروژه را ثبت کنید.</p>
        <button @click="requestProject" class="btn" :disabled="studentStore.loading">
          {{ studentStore.loading ? 'در حال ارسال...' : 'درخواست پروژه' }}
        </button>
      </div>
      
      <!-- وضعیت پروژه -->
      <div v-else class="card">
        <h2>وضعیت پروژه</h2>
        <p><strong>کد پروژه:</strong> {{ studentStore.project.projectCode }}</p>
        <p>
          <strong>وضعیت:</strong>
          <span :class="['status-badge', `status-${studentStore.project.status}`]">
            {{ getStatusText(studentStore.project.status) }}
          </span>
        </p>
        
        <p v-if="studentStore.project.supervisor">
          <strong>استاد راهنما:</strong> 
          {{ studentStore.project.supervisor.firstName }} {{ studentStore.project.supervisor.lastName }}
        </p>
        
        <p v-if="studentStore.project.examiner">
          <strong>استاد داور:</strong>
          {{ studentStore.project.examiner.firstName }} {{ studentStore.project.examiner.lastName }}
        </p>
        
        <p v-if="studentStore.project.topic">
          <strong>موضوع پروژه:</strong> {{ studentStore.project.topic }}
        </p>
        
        <p v-if="studentStore.project.defenseDate">
          <strong>تاریخ دفاعیه:</strong> 
          {{ new Date(studentStore.project.defenseDate).toLocaleDateString('fa-IR') }}
        </p>
        <p v-if="studentStore.project.defenseTime">
          <strong>ساعت دفاعیه:</strong> {{ studentStore.project.defenseTime }}
        </p>
      </div>
      
      <!-- پیشنهاد موضوع -->
      <div v-if="studentStore.project?.status === 'topic_proposal'" class="card">
        <h2>پیشنهاد موضوع پروژه</h2>
        <p>لطفاً موضوعات پیشنهادی خود را برای استاد راهنما ارسال کنید.</p>
        
        <div class="form-group">
          <label>موضوع پیشنهادی:</label>
          <textarea v-model="topicInput" rows="3"></textarea>
        </div>
        <button @click="proposeTopic" class="btn" :disabled="studentStore.loading || !topicInput.trim()">
          {{ studentStore.loading ? 'در حال ارسال...' : 'ارسال موضوع' }}
        </button>
        
        <div v-if="studentStore.project.proposedTopics?.length > 0">
          <h3>موضوعات پیشنهادی شما:</h3>
          <ul class="topics-list">
            <li v-for="(topic, index) in studentStore.project.proposedTopics" :key="index">
              {{ topic.topic }}
            </li>
          </ul>
        </div>
      </div>
      
      <!-- ارسال گزارش -->
      <div v-if="studentStore.project?.status === 'in_progress'" class="card">
        <h2>ارسال گزارش پیشرفت</h2>
        
        <div class="form-group">
          <label>گزارش:</label>
          <textarea v-model="reportInput" rows="5"></textarea>
        </div>
        <button @click="submitReport" class="btn" :disabled="studentStore.loading || !reportInput.trim()">
          {{ studentStore.loading ? 'در حال ارسال...' : 'ارسال گزارش' }}
        </button>
        
        <div v-if="studentStore.project.reports?.length > 0">
          <h3>گزارش‌های ارسالی:</h3>
          <div 
            v-for="(report, index) in studentStore.project.reports" 
            :key="index" 
            class="report-item"
          >
            <p><strong>گزارش {{ index + 1 }}</strong> - {{ new Date(report.submittedAt).toLocaleDateString('fa-IR') }}</p>
            <p>{{ report.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useStudentStore } from '../../stores/student'

const router = useRouter()
const authStore = useAuthStore()
const studentStore = useStudentStore()

const message = ref({ text: '', type: '' })
const topicInput = ref('')
const reportInput = ref('')

onMounted(async () => {
  try {
    await studentStore.fetchDashboard()
  } catch (error) {
    message.value = { text: 'خطا در دریافت اطلاعات', type: 'error' }
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const requestProject = async () => {
  try {
    const result = await studentStore.requestProject()
    message.value = { text: result.message, type: 'success' }
  } catch (error) {
    message.value = { text: studentStore.error, type: 'error' }
  }
}

const proposeTopic = async () => {
  try {
    const result = await studentStore.proposeTopic(topicInput.value)
    message.value = { text: result.message, type: 'success' }
    topicInput.value = ''
  } catch (error) {
    message.value = { text: studentStore.error, type: 'error' }
  }
}

const submitReport = async () => {
  try {
    const result = await studentStore.submitReport(reportInput.value)
    message.value = { text: result.message, type: 'success' }
    reportInput.value = ''
  } catch (error) {
    message.value = { text: studentStore.error, type: 'error' }
  }
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'در انتظار تایید مدیر گروه',
    'approved': 'تایید شده',
    'topic_proposal': 'آماده پیشنهاد موضوع',
    'topic_approved': 'موضوع تایید شده',
    'in_progress': 'در حال انجام',
    'defense_scheduled': 'زمان دفاعیه تعیین شده',
    'completed': 'تکمیل شده'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  padding: 15px 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar h1 {
  color: #667eea;
  font-size: 24px;
  margin: 0;
}

.logout-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 20px;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: #764ba2;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  margin-bottom: 20px;
}

.card h2, .card h3 {
  color: #667eea;
  margin-bottom: 20px;
}

.card p {
  margin-bottom: 10px;
  line-height: 1.6;
}

.btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.btn:hover:not(:disabled) {
  background: #764ba2;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-approved, .status-in_progress, .status-completed {
  background: #d4edda;
  color: #155724;
}

.status-topic_proposal {
  background: #d1ecf1;
  color: #0c5460;
}

.status-defense_scheduled {
  background: #cce5ff;
  color: #004085;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  transition: border 0.3s;
}

.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.topics-list {
  margin-top: 15px;
  padding-right: 20px;
}

.topics-list li {
  margin-bottom: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
}

.report-item {
  border: 1px solid #e0e0e0;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
}

.report-item p:first-child {
  font-weight: bold;
  color: #667eea;
}
</style>

import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useStudentStore = defineStore('student', {
  state: () => ({
    project: null,
    student: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_URL}/student/dashboard`)
        this.student = response.data.student
        this.project = response.data.project
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در دریافت اطلاعات'
        throw error
      } finally {
        this.loading = false
      }
    },

    async requestProject() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_URL}/student/request-project`)
        await this.fetchDashboard()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در درخواست پروژه'
        throw error
      } finally {
        this.loading = false
      }
    },

    async proposeTopic(topic) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_URL}/student/propose-topic`, { topic })
        await this.fetchDashboard()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در پیشنهاد موضوع'
        throw error
      } finally {
        this.loading = false
      }
    },

    async submitReport(report) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_URL}/student/submit-report`, { report })
        await this.fetchDashboard()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ارسال گزارش'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

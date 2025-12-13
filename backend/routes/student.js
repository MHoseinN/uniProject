const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { isStudent } = require('../middleware/auth');

// اعمال middleware برای تمام مسیرها
router.use(isStudent);

// داشبورد دانشجو
router.get('/dashboard', studentController.getDashboard);

// درخواست پروژه
router.post('/request-project', studentController.requestProject);

// پیشنهاد موضوع
router.post('/propose-topic', studentController.proposeTopic);

// ارسال گزارش
router.post('/submit-report', studentController.submitReport);

// پیام‌ها
router.post('/send-message', studentController.sendMessage);
router.get('/messages', studentController.getMessages);

module.exports = router;

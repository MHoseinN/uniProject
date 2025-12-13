const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');
const { isProfessor } = require('../middleware/auth');

// اعمال middleware برای تمام مسیرها
router.use(isProfessor);

// داشبورد استاد
router.get('/dashboard', professorController.getDashboard);

// مشاهده موضوعات پیشنهادی
router.get('/proposed-topics/:projectId', professorController.getProposedTopics);

// تایید موضوع
router.post('/approve-topic', professorController.approveTopic);

// مشاهده گزارشات
router.get('/reports/:projectId', professorController.getReports);

// پیشنهاد زمان دفاعیه
router.post('/propose-defense-time', professorController.proposeDefenseTime);
router.get('/proposed-times', professorController.getProposedTimes);

// پیام‌ها
router.post('/send-message', professorController.sendMessage);

module.exports = router;

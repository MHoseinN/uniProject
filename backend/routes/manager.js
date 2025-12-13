const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { isManager } = require('../middleware/auth');

// اعمال middleware برای تمام مسیرها
router.use(isManager);

// داشبورد مدیر گروه
router.get('/dashboard', managerController.getDashboard);

// تایید پروژه و انتخاب اساتید
router.post('/approve-project', managerController.approveProject);

// دریافت لیست اساتید
router.get('/professors', managerController.getProfessors);

// تایید زمان‌های دفاعیه
router.post('/approve-defense-times', managerController.approveDefenseTimes);

// پیام‌ها
router.post('/send-message', managerController.sendMessage);

module.exports = router;

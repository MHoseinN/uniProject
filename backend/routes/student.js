const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/jwt');
const upload = require('../utils/upload');

/**
 * @route   GET /api/student/dashboard
 * @desc    دریافت داشبورد دانشجو (اطلاعات شخصی + پروژه فعال)
 * @access  Private - Student
 */
router.get('/dashboard', authenticate, authorize('student'), studentController.getDashboard);

/**
 * @route   POST /api/student/request-project
 * @desc    درخواست اخذ پروژه در ترم فعال
 * @access  Private - Student
 */
router.post('/request-project', authenticate, authorize('student'), studentController.requestProject);

/**
 * @route   POST /api/student/propose-topic
 * @desc    پیشنهاد موضوع پروژه
 * @access  Private - Student
 */
router.post('/propose-topic', authenticate, authorize('student'), studentController.proposeTopic);

/**
 * @route   POST /api/student/submit-report
 * @desc    ارسال گزارش پیشرفت (متن + فایل اختیاری)
 * @access  Private - Student
 */
router.post('/submit-report', authenticate, authorize('student'), upload.single('file'), studentController.submitReport);

/**
 * @route   GET /api/student/final-status
 * @desc    مشاهده نمره و وضعیت نهایی پروژه
 * @access  Private - Student
 */
router.get('/final-status', authenticate, authorize('student'), studentController.getFinalStatus);

module.exports = router;

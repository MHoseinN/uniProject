const express = require('express');
const router = express.Router();
const headController = require('../controllers/headOfDepartmentController');
const { authenticate, authorize } = require('../middleware/jwt');
const { validateTerm } = require('../validators');

/**
 * @route   POST /api/head/terms
 * @desc    تعریف ترم جدید (ترم قبلی غیرفعال می‌شود)
 * @access  Private - Head of Department
 * @body    name, startDate, endDate, capacities: Array<{major, maxProjects}>
 */
router.post('/terms', authenticate, authorize('head_of_department'), validateTerm, headController.createTerm);

/**
 * @route   PUT /api/head/terms/:termId/capacity
 * @desc    تنظیم/به‌روزرسانی ظرفیت پروژه برای هر رشته
 * @access  Private - Head of Department
 * @body    capacities: Array<{major, maxProjects}>
 */
router.put('/terms/:termId/capacity', authenticate, authorize('head_of_department'), headController.setCapacity);

/**
 * @route   POST /api/head/examiner-limits
 * @desc    تنظیم محدودیت تعداد دانشجوی داوری برای هر استاد
 * @access  Private - Head of Department
 * @body    professorId, maxExaminees
 */
router.post('/examiner-limits', authenticate, authorize('head_of_department'), headController.setExaminerLimits);

/**
 * @route   GET /api/head/pending-projects
 * @desc    دریافت لیست درخواست‌های پروژه در انتظار تأیید
 * @access  Private - Head of Department
 */
router.get('/pending-projects', authenticate, authorize('head_of_department'), headController.getPendingProjects);

/**
 * @route   POST /api/head/projects/:projectId/approve
 * @desc    تأیید درخواست پروژه دانشجو
 * @access  Private - Head of Department
 */
router.post('/projects/:projectId/approve', authenticate, authorize('head_of_department'), headController.approveProject);

/**
 * @route   POST /api/head/assign-supervisors
 * @desc    تخصیص خودکار اساتید راهنما به پروژه‌های تأیید شده (الگوریتم عادلانه)
 * @access  Private - Head of Department
 */
router.post('/assign-supervisors', authenticate, authorize('head_of_department'), headController.assignSupervisors);

/**
 * @route   POST /api/head/assign-examiners
 * @desc    تخصیص خودکار اساتید داور (با اطمینان از راهنما ≠ داور)
 * @access  Private - Head of Department
 */
router.post('/assign-examiners', authenticate, authorize('head_of_department'), headController.assignExaminers);

/**
 * @route   POST /api/head/schedule-defenses
 * @desc    زمان‌بندی خودکار دفاع‌ها (بدون تداخل زمانی اساتید)
 * @access  Private - Head of Department
 */
router.post('/schedule-defenses', authenticate, authorize('head_of_department'), headController.scheduleDefenses);

/**
 * @route   GET /api/head/statistics
 * @desc    مشاهده آمار کلی ترم فعال
 * @access  Private - Head of Department
 */
router.get('/statistics', authenticate, authorize('head_of_department'), headController.getStatistics);

module.exports = router;

const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');
const { authenticate, authorize } = require('../middleware/jwt');

/**
 * @route   GET /api/professor/projects
 * @desc    دریافت لیست پروژه‌های استاد (راهنما و داور)
 * @access  Private - Professor
 * @query   role: 'supervisor' | 'examiner' (اختیاری)
 */
router.get('/projects', authenticate, authorize('professor'), professorController.getProjects);

/**
 * @route   GET /api/professor/projects/:projectId/proposed-topics
 * @desc    مشاهده موضوعات پیشنهادی دانشجو
 * @access  Private - Professor (Supervisor)
 */
router.get('/projects/:projectId/proposed-topics', authenticate, authorize('professor'), professorController.getProposedTopics);

/**
 * @route   POST /api/professor/projects/:projectId/approve-topic
 * @desc    تأیید موضوع پروژه
 * @access  Private - Professor (Supervisor)
 * @body    topicIndex: number
 */
router.post('/projects/:projectId/approve-topic', authenticate, authorize('professor'), professorController.approveTopic);

/**
 * @route   POST /api/professor/projects/:projectId/defense-times
 * @desc    ارسال زمان‌های پیشنهادی دفاع
 * @access  Private - Professor (Examiner)
 * @body    times: Array<{date, startTime, endTime}>
 */
router.post('/projects/:projectId/defense-times', authenticate, authorize('professor'), professorController.submitDefenseTimes);

/**
 * @route   POST /api/professor/projects/:projectId/grade
 * @desc    ثبت نمره نهایی پروژه
 * @access  Private - Professor (Examiner)
 * @body    grade: number (0-20)
 */
router.post('/projects/:projectId/grade', authenticate, authorize('professor'), professorController.gradeProject);

/**
 * @route   GET /api/professor/projects/:projectId/reports
 * @desc    مشاهده گزارش‌های پیشرفت دانشجو
 * @access  Private - Professor (Supervisor/Examiner)
 */
router.get('/projects/:projectId/reports', authenticate, authorize('professor'), professorController.getProjectReports);

module.exports = router;

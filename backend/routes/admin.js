const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/jwt');

/**
 * @route   GET /api/admin/pending-users
 * @desc    دریافت لیست کاربران در انتظار تأیید
 * @access  Private - Admin
 */
router.get('/pending-users', authenticate, authorize('admin'), adminController.getPendingUsers);

/**
 * @route   POST /api/admin/users/:userId/approve
 * @desc    تأیید کاربر
 * @access  Private - Admin
 */
router.post('/users/:userId/approve', authenticate, authorize('admin'), adminController.approveUser);

/**
 * @route   POST /api/admin/users/:userId/reject
 * @desc    رد کاربر
 * @access  Private - Admin
 */
router.post('/users/:userId/reject', authenticate, authorize('admin'), adminController.rejectUser);

/**
 * @route   GET /api/admin/users
 * @desc    دریافت لیست تمام کاربران (با pagination)
 * @access  Private - Admin
 * @query   page, limit, role
 */
router.get('/users', authenticate, authorize('admin'), adminController.getAllUsers);

/**
 * @route   GET /api/admin/logs
 * @desc    مشاهده لاگ‌های سیستم با فیلترهای پیشرفته
 * @access  Private - Admin
 * @query   action, userId, projectId, startDate, endDate, page, limit
 */
router.get('/logs', authenticate, authorize('admin'), adminController.getLogs);

module.exports = router;

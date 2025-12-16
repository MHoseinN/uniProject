const express = require('express');
const router = express.Router();
const messagingController = require('../controllers/messagingController');
const { authenticate } = require('../middleware/jwt');
const { validateMessage } = require('../validators');

/**
 * @route   POST /api/messages/send
 * @desc    ارسال پیام به کاربر دیگر
 * @access  Private
 * @body    to, subject, content, relatedProject (optional)
 */
router.post('/send', authenticate, validateMessage, messagingController.sendMessage);

/**
 * @route   GET /api/messages/inbox
 * @desc    دریافت صندوق ورودی
 * @access  Private
 * @query   page, limit, unreadOnly
 */
router.get('/inbox', authenticate, messagingController.getInbox);

/**
 * @route   GET /api/messages/sent
 * @desc    دریافت پیام‌های ارسال شده
 * @access  Private
 * @query   page, limit
 */
router.get('/sent', authenticate, messagingController.getSentMessages);

/**
 * @route   PUT /api/messages/:messageId/read
 * @desc    علامت‌گذاری پیام به عنوان خوانده شده
 * @access  Private
 */
router.put('/:messageId/read', authenticate, messagingController.markAsRead);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    حذف پیام
 * @access  Private
 */
router.delete('/:messageId', authenticate, messagingController.deleteMessage);

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    دریافت مکالمه با یک کاربر خاص
 * @access  Private
 */
router.get('/conversation/:userId', authenticate, messagingController.getConversation);

/**
 * @route   GET /api/messages/conversations
 * @desc    دریافت لیست مکالمات (کاربرانی که با آنها پیام رد و بدل شده)
 * @access  Private
 */
router.get('/conversations', authenticate, messagingController.getConversations);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/jwt');
const { validateRegister, validateLogin } = require('../validators');

/**
 * @route   POST /api/auth/register
 * @desc    ثبت‌نام کاربر جدید (نیاز به تأیید admin)
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    ورود کاربر و دریافت JWT
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    دریافت پروفایل کاربر احراز هویت شده
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;

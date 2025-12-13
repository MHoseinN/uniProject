const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// صفحه ثبت نام
router.get('/register', authController.getRegister);

// ثبت نام
router.post('/register/student', authController.registerStudent);
router.post('/register/professor', authController.registerProfessor);
router.post('/register/manager', authController.registerManager);

// صفحه ورود
router.get('/login', authController.getLogin);

// ورود
router.post('/login/student', authController.loginStudent);
router.post('/login/professor', authController.loginProfessor);
router.post('/login/manager', authController.loginManager);

// خروج
router.get('/logout', authController.logout);

module.exports = router;

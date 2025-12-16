const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { logAction } = require('../utils/logger');

/**
 * ثبت‌نام کاربر جدید (نیاز به تأیید ادمین)
 * POST /auth/register
 */
async function register(req, res) {
  try {
    const { firstName, lastName, nationalCode, password, role, major, studentNumber, professorId, managerId } = req.body;
    
    // بررسی تکراری بودن کد ملی
    const existingUser = await User.findOne({ nationalCode });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'کاربری با این کد ملی قبلاً ثبت‌نام کرده است'
      });
    }
    
    // ساخت کاربر جدید
    const userData = {
      firstName,
      lastName,
      nationalCode,
      password, // به‌صورت خودکار هش می‌شود
      role,
      major,
      isApproved: false // نیاز به تأیید
    };
    
    // اضافه کردن فیلدهای اختصاصی بر اساس نقش
    if (role === 'student' && studentNumber) {
      userData.studentNumber = studentNumber;
    } else if (role === 'professor' && professorId) {
      userData.professorId = professorId;
    } else if (role === 'head_of_department' && managerId) {
      userData.managerId = managerId;
    }
    
    const user = await User.create(userData);
    
    // ثبت لاگ
    await logAction('USER_REGISTER', user._id, {
      details: { role, major },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    return res.status(201).json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد. لطفاً منتظر تأیید مدیر سیستم باشید.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        nationalCode: user.nationalCode,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('خطا در ثبت‌نام:', error);
    
    // خطای تکراری بودن
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field === 'studentNumber' ? 'شماره دانشجویی' : field === 'professorId' ? 'شماره شناسایی استادی' : field} تکراری است`
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'خطای سرور در ثبت‌نام'
    });
  }
}

/**
 * ورود کاربر با JWT
 * POST /auth/login
 */
async function login(req, res) {
  try {
    const { nationalCode, password } = req.body;
    
    // یافتن کاربر
    const user = await User.findOne({ nationalCode });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'کد ملی یا رمز عبور اشتباه است'
      });
    }
    
    // بررسی رمز عبور
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'کد ملی یا رمز عبور اشتباه است'
      });
    }
    
    // بررسی فعال بودن
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'حساب کاربری شما غیرفعال است'
      });
    }
    
    // بررسی تأیید شدن (به‌جز ادمین)
    if (!user.isApproved && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'حساب کاربری شما هنوز تأیید نشده است. لطفاً منتظر بمانید.'
      });
    }
    
    // تولید JWT Token
    const token = generateToken(user);
    
    // ثبت لاگ
    await logAction('USER_LOGIN', user._id, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    return res.json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        nationalCode: user.nationalCode,
        role: user.role,
        major: user.major,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('خطا در ورود:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور در ورود'
    });
  }
}

/**
 * دریافت اطلاعات کاربر فعلی
 * GET /auth/profile
 */
async function getProfile(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('خطا در دریافت پروفایل:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

module.exports = {
  register,
  login,
  getProfile
};

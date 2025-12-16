const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware احراز هویت با JWT
 */
async function authenticate(req, res, next) {
  try {
    // دریافت token از header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'توکن احراز هویت یافت نشد'
      });
    }
    
    const token = authHeader.substring(7); // حذف "Bearer "
    
    // تأیید token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'توکن نامعتبر یا منقضی شده است'
      });
    }
    
    // دریافت کاربر از دیتابیس
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'کاربر یافت نشد یا غیرفعال است'
      });
    }
    
    // چک کردن تأیید شدن کاربر
    if (!user.isApproved && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'حساب کاربری شما هنوز تأیید نشده است'
      });
    }
    
    // اضافه کردن کاربر به request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('خطا در احراز هویت:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور در احراز هویت'
    });
  }
}

/**
 * Middleware بررسی نقش کاربر
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'لطفاً ابتدا وارد سیستم شوید'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'شما مجوز دسترسی به این بخش را ندارید'
      });
    }
    
    next();
  };
}

/**
 * Middleware اختیاری: اجازه به کاربر تأیید نشده
 */
async function authenticateOptionalApproval(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'توکن احراز هویت یافت نشد'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'توکن نامعتبر یا منقضی شده است'
      });
    }
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'کاربر یافت نشد یا غیرفعال است'
      });
    }
    
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('خطا در احراز هویت:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور در احراز هویت'
    });
  }
}

module.exports = {
  authenticate,
  authorize,
  authenticateOptionalApproval
};

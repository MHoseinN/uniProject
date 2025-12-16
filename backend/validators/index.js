const { body, validationResult } = require('express-validator');

/**
 * میدلور بررسی نتیجه validation
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'خطا در اعتبارسنجی ورودی',
      errors: errors.array()
    });
  }
  next();
}

/**
 * Validation ثبت‌نام
 */
const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('نام الزامی است'),
  body('lastName').trim().notEmpty().withMessage('نام خانوادگی الزامی است'),
  body('email')
    .trim()
    .isEmail().withMessage('ایمیل نامعتبر است')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('رمز عبور باید حداقل ۶ کاراکتر باشد'),
  body('role')
    .isIn(['student', 'professor', 'head_of_department', 'admin'])
    .withMessage('نقش نامعتبر است'),
  validate
];

/**
 * Validation ورود
 */
const loginValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('ایمیل نامعتبر است')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('رمز عبور الزامی است'),
  validate
];

/**
 * Validation ارسال پیام
 */
const messageValidation = [
  body('to').isMongoId().withMessage('گیرنده نامعتبر است'),
  body('subject').trim().notEmpty().withMessage('موضوع الزامی است'),
  body('content').trim().notEmpty().withMessage('متن پیام الزامی است'),
  validate
];

/**
 * Validation تعریف ترم
 */
const termValidation = [
  body('name').trim().notEmpty().withMessage('نام ترم الزامی است'),
  body('startDate').isISO8601().withMessage('تاریخ شروع نامعتبر است'),
  body('endDate').isISO8601().withMessage('تاریخ پایان نامعتبر است'),
  body('capacities').isArray().withMessage('ظرفیت‌ها باید آرایه باشد'),
  validate
];

module.exports = {
  validateRegister: registerValidation,
  validateLogin: loginValidation,
  validateMessage: messageValidation,
  validateTerm: termValidation,
  validate
};

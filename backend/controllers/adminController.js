const User = require('../models/User');
const { logAction } = require('../utils/logger');
const { getAllLogs } = require('../utils/logger');

/**
 * دریافت لیست کاربران در انتظار تأیید
 * GET /admin/pending-users
 */
async function getPendingUsers(req, res) {
  try {
    const pendingUsers = await User.find({ isApproved: false, role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      count: pendingUsers.length,
      users: pendingUsers
    });
  } catch (error) {
    console.error('خطا در دریافت کاربران:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * تأیید کاربر
 * POST /admin/approve-user/:userId
 */
async function approveUser(req, res) {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'این کاربر قبلاً تأیید شده است'
      });
    }
    
    user.isApproved = true;
    user.approvedBy = req.userId;
    user.approvedAt = new Date();
    await user.save();
    
    // ثبت لاگ
    await logAction('USER_APPROVED', req.userId, {
      targetUser: user._id,
      details: { role: user.role, major: user.major },
      ipAddress: req.ip
    });
    
    return res.json({
      success: true,
      message: `کاربر ${user.firstName} ${user.lastName} با موفقیت تأیید شد`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('خطا در تأیید کاربر:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * رد کاربر (غیرفعال کردن)
 * POST /admin/reject-user/:userId
 */
async function rejectUser(req, res) {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    user.isActive = false;
    await user.save();
    
    // ثبت لاگ
    await logAction('USER_REJECTED', req.userId, {
      targetUser: user._id,
      details: { role: user.role },
      ipAddress: req.ip
    });
    
    return res.json({
      success: true,
      message: 'کاربر رد شد'
    });
  } catch (error) {
    console.error('خطا در رد کاربر:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * دریافت تمام کاربران
 * GET /admin/users
 */
async function getAllUsers(req, res) {
  try {
    const { role, isApproved, page = 1, limit = 50 } = req.query;
    
    const query = { role: { $ne: 'admin' } };
    
    if (role) query.role = role;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    return res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      users
    });
  } catch (error) {
    console.error('خطا در دریافت کاربران:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * دریافت لاگ‌های سیستم
 * GET /admin/logs
 */
async function getLogs(req, res) {
  try {
    const { action, performedBy, dateFrom, dateTo, page = 1, limit = 100 } = req.query;
    
    const filters = {};
    if (action) filters.action = action;
    if (performedBy) filters.performedBy = performedBy;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await getAllLogs(filters, parseInt(limit), skip);
    
    return res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      logs
    });
  } catch (error) {
    console.error('خطا در دریافت لاگ‌ها:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

module.exports = {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  getLogs
};

const AuditLog = require('../models/AuditLog');

/**
 * ثبت لاگ در سیستم
 */
async function logAction(action, performedBy, options = {}) {
  try {
    const logEntry = {
      action,
      performedBy,
      targetUser: options.targetUser || null,
      targetProject: options.targetProject || null,
      details: options.details || {},
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null
    };
    
    await AuditLog.create(logEntry);
  } catch (error) {
    console.error('خطا در ثبت لاگ:', error.message);
    // لاگ نباید باعث توقف عملیات اصلی شود
  }
}

/**
 * دریافت لاگ‌های یک کاربر
 */
async function getUserLogs(userId, limit = 50) {
  return await AuditLog.find({ performedBy: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('targetUser', 'firstName lastName nationalCode role')
    .populate('targetProject', 'projectCode topic')
    .lean();
}

/**
 * دریافت لاگ‌های یک پروژه
 */
async function getProjectLogs(projectId, limit = 50) {
  return await AuditLog.find({ targetProject: projectId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('performedBy', 'firstName lastName role')
    .lean();
}

/**
 * دریافت تمام لاگ‌ها (فقط ادمین)
 */
async function getAllLogs(filters = {}, limit = 100, skip = 0) {
  const query = {};
  
  if (filters.action) {
    query.action = filters.action;
  }
  
  if (filters.performedBy) {
    query.performedBy = filters.performedBy;
  }
  
  if (filters.dateFrom) {
    query.createdAt = { $gte: new Date(filters.dateFrom) };
  }
  
  if (filters.dateTo) {
    query.createdAt = { ...query.createdAt, $lte: new Date(filters.dateTo) };
  }
  
  return await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('performedBy', 'firstName lastName role')
    .populate('targetUser', 'firstName lastName nationalCode role')
    .populate('targetProject', 'projectCode topic')
    .lean();
}

module.exports = {
  logAction,
  getUserLogs,
  getProjectLogs,
  getAllLogs
};

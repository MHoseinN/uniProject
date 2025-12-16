const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'USER_REGISTER',
      'USER_LOGIN',
      'USER_APPROVED',
      'USER_REJECTED',
      'TERM_CREATED',
      'TERM_ACTIVATED',
      'PROJECT_REQUESTED',
      'PROJECT_APPROVED',
      'PROJECT_REJECTED',
      'SUPERVISOR_ASSIGNED',
      'EXAMINER_ASSIGNED',
      'TOPIC_PROPOSED',
      'TOPIC_APPROVED',
      'REPORT_SUBMITTED',
      'DEFENSE_TIMES_SUBMITTED',
      'DEFENSE_TIME_ASSIGNED',
      'GRADE_SUBMITTED',
      'MESSAGE_SENT',
      'CAPACITY_SET',
      'EXAMINER_LIMIT_SET'
    ]
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  targetProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, { 
  timestamps: true 
});

// ایندکس برای جستجوی سریع‌تر
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetUser: 1 });
auditLogSchema.index({ targetProject: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'موضوع پیام الزامی است'],
    trim: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: [true, 'متن پیام الزامی است'],
    trim: true,
    maxlength: 5000
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  // برای ارجاع به پروژه (اختیاری)
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  }
}, { 
  timestamps: true 
});

// ایندکس برای دریافت پیام‌های یک کاربر
messageSchema.index({ to: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ from: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

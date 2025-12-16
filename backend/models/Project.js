const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term',
    required: true
  },
  projectCode: {
    type: String,
    unique: true,
    required: true
  },
  major: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',           // در انتظار تأیید مدیر گروه
      'approved',          // تأیید شده و در انتظار تخصیص استاد
      'supervisor_assigned', // استاد راهنما تخصیص شده
      'topic_proposal',    // آماده دریافت پیشنهاد موضوع
      'topic_approved',    // موضوع تأیید شده
      'in_progress',       // در حال انجام
      'defense_scheduled', // زمان دفاع تعیین شده
      'completed',         // تکمیل شده و نمره ثبت شده
      'rejected'           // رد شده
    ],
    default: 'pending'
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  examiner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  proposedTopics: [{
    topic: {
      type: String,
      required: true
    },
    proposedAt: {
      type: Date,
      default: Date.now
    }
  }],
  topic: {
    type: String,
    default: null
  },
  topicApprovedAt: {
    type: Date,
    default: null
  },
  reports: [{
    content: {
      type: String,
      default: null
    },
    fileUrl: {
      type: String,
      default: null
    },
    fileName: {
      type: String,
      default: null
    },
    fileSize: {
      type: Number,
      default: null
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // زمان‌های دفاع پیشنهادی استاد داور
  proposedDefenseTimes: [{
    date: Date,
    startTime: String, // "08:00"
    endTime: String,   // "08:30"
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  defenseDate: {
    type: Date,
    default: null
  },
  defenseStartTime: {
    type: String,
    default: null
  },
  defenseEndTime: {
    type: String,
    default: null
  },
  defenseLocation: {
    type: String,
    default: null
  },
  grade: {
    type: Number,
    min: 0,
    max: 20,
    default: null
  },
  gradedAt: {
    type: Date,
    default: null
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // تاریخ‌های مهم
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

// تولید کد پروژه قبل از ذخیره
projectSchema.pre('save', async function(next) {
  if (!this.projectCode) {
    const count = await mongoose.model('Project').countDocuments();
    this.projectCode = `PRJ${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ایندکس‌ها برای جستجوی سریع
projectSchema.index({ student: 1, term: 1 });
projectSchema.index({ supervisor: 1, status: 1 });
projectSchema.index({ examiner: 1, status: 1 });
projectSchema.index({ term: 1, major: 1, status: 1 });
projectSchema.index({ status: 1 });

// اطمینان از اینکه هر دانشجو فقط یک پروژه فعال در هر ترم دارد
projectSchema.index({ student: 1, term: 1, status: 1 }, { 
  unique: true,
  partialFilterExpression: { status: { $nin: ['completed', 'rejected'] } }
});

module.exports = mongoose.model('Project', projectSchema);

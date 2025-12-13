const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectCode: {
    type: String,
    unique: true,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  proposedTopics: [{
    topic: String,
    proposedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'topic_proposal', 'topic_approved', 'in_progress', 'defense_scheduled', 'completed'],
    default: 'pending'
  },
  defenseDate: {
    type: Date,
    default: null
  },
  defenseTime: {
    type: String,
    default: null
  },
  reports: [{
    content: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    default: null
  },
  examiner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    default: null
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
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

module.exports = mongoose.model('Project', projectSchema);

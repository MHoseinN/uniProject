const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'نام الزامی است'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'نام خانوادگی الزامی است'],
    trim: true
  },
  nationalCode: {
    type: String,
    required: [true, 'کد ملی الزامی است'],
    unique: true,
    match: [/^\d{10}$/, 'کد ملی باید ۱۰ رقم باشد']
  },
  password: {
    type: String,
    required: [true, 'رمز عبور الزامی است']
  },
  role: {
    type: String,
    enum: ['student', 'professor', 'head_of_department', 'admin'],
    required: true
  },
  major: {
    type: String,
    required: function() {
      return this.role !== 'admin';
    },
    trim: true
  },
  // اطلاعات اختصاصی دانشجو
  studentNumber: {
    type: String,
    unique: true,
    sparse: true, // allows multiple null values
    trim: true
  },
  // اطلاعات اختصاصی استاد
  professorId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  maxExaminerCapacity: {
    type: Number,
    default: null // مدیر گروه تعیین می‌کند
  },
  // اطلاعات اختصاصی مدیر گروه
  managerId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  // وضعیت تأیید
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  // وضعیت فعال/غیرفعال
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Hash password قبل از ذخیره
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// متد مقایسه رمز عبور
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// متد بازگرداندن اطلاعات بدون رمز عبور
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

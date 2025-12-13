const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
  studentNumber: {
    type: String,
    required: [true, 'شماره دانشجویی الزامی است'],
    unique: true,
    trim: true
  },
  nationalCode: {
    type: String,
    required: [true, 'کد ملی الزامی است'],
    unique: true,
    match: [/^\d{10}$/, 'کد ملی باید ۱۰ رقم باشد']
  },
  major: {
    type: String,
    required: [true, 'رشته تحصیلی الزامی است'],
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  role: {
    type: String,
    default: 'student'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Student', studentSchema);

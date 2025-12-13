const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
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
  professorId: {
    type: String,
    required: [true, 'شماره شناسایی استاد الزامی است'],
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
  role: {
    type: String,
    default: 'professor'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Professor', professorSchema);

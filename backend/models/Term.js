const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام ترم الزامی است'],
    trim: true,
    unique: true
    // مثال: "۱۴۰۳-۰۲" یا "بهار ۱۴۰۳"
  },
  startDate: {
    type: Date,
    required: [true, 'تاریخ شروع ترم الزامی است']
  },
  endDate: {
    type: Date,
    required: [true, 'تاریخ پایان ترم الزامی است']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  // ظرفیت به تفکیک رشته
  capacities: [{
    major: {
      type: String,
      required: true
    },
    maxProjects: {
      type: Number,
      required: true,
      min: 0
    },
    currentCount: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

// تنها یک ترم فعال در هر لحظه
termSchema.pre('save', async function(next) {
  if (this.isActive) {
    await mongoose.model('Term').updateMany(
      { _id: { $ne: this._id }, isActive: true },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model('Term', termSchema);

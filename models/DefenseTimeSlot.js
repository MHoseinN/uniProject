const mongoose = require('mongoose');

const defenseTimeSlotSchema = new mongoose.Schema({
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['proposed', 'approved', 'rejected'],
    default: 'proposed'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('DefenseTimeSlot', defenseTimeSlotSchema);

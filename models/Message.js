const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'fromModel',
    required: true
  },
  fromModel: {
    type: String,
    required: true,
    enum: ['Student', 'Professor', 'Manager']
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'toModel',
    required: true
  },
  toModel: {
    type: String,
    required: true,
    enum: ['Student', 'Professor', 'Manager']
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Message', messageSchema);

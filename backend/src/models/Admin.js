const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String,
  adminId: Number
});

module.exports = mongoose.model('Admin', adminSchema);

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  unitPrice: Number,
  count: Number
});

const reservationSchema = new mongoose.Schema({
  trackingCode: { type: Number, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [itemSchema],
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  received: { type: Boolean, default: false },
  returned: { type: Boolean, default: false },
  paid: { type: Boolean, default: false },
  lateHours: { type: Number, default: 0 },
  finalPrice: Number
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);

const express = require('express');
const Reservation = require('../models/Reservation');
const Product = require('../models/Product');
const { requireUser } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireUser, async (req, res) => {
  try {
    const { items, startDate, endDate } = req.body;
    const ids = items.map(i => i.productId);
    const products = await Product.find({ productId: { $in: ids } });
    const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
    let total = 0;
    const itemDocs = [];
    for (const item of items) {
      const product = products.find(p => p.productId === item.productId);
      if (!product || product.quantity < item.count) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      product.quantity -= item.count;
      await product.save();
      total += product.price * item.count * days;
      itemDocs.push({ productId: product.productId, name: product.name, unitPrice: product.price, count: item.count });
    }
    const last = await Reservation.findOne().sort({ trackingCode: -1 });
    const trackingCode = last ? last.trackingCode + 1 : 100;
    await Reservation.create({
      trackingCode,
      user: req.userId,
      items: itemDocs,
      startDate,
      endDate,
      totalPrice: total,
      finalPrice: total
    });
    res.json({ trackingCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', requireUser, async (req, res) => {
  const reservations = await Reservation.find({ user: req.userId });
  res.json(reservations);
});

router.get('/me/:trackingCode', requireUser, async (req, res) => {
  const { trackingCode } = req.params;
  const reservation = await Reservation.findOne({ user: req.userId, trackingCode });
  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  res.json(reservation);
});

module.exports = router;

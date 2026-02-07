const express = require('express');
const User = require('../models/User');
const { requireUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireUser, async (req, res) => {
  const user = await User.findById(req.userId, 'messages');
  res.json(user ? user.messages : []);
});

module.exports = router;

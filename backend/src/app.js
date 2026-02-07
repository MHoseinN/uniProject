const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const seed = require('./seed');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const reservationRoutes = require('./routes/reservations');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'RentShot API running' });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI ||'mongodb://127.0.0.1:27017/rentshot';

mongoose.connect(MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Mongodb connection error', err);
});

module.exports = app;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const Admin = require('./models/Admin');
const User = require('./models/User');
const { randomCode } = require('./utils/generateCode');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentshot';

const products = [
  { name: 'اف ایکس ۳', price: 1200000, quantity: 4, category: 'دوربین' },
  { name: 'آلفا ۷', price: 800000, quantity: 4, category: 'دوربین' },
  { name: '۵ دی', price: 450000, quantity: 4, category: 'دوربین' },
  { name: '۸۰ دی', price: 350000, quantity: 4, category: 'دوربین' },
  { name: '۲۴-۱۰۵ کنون', price: 350000, quantity: 4, category: 'لنز' },
  { name: '۱۶-۳۵ کنون', price: 300000, quantity: 4, category: 'لنز' },
  { name: '۱۰۰ ماکرو کنون', price: 350000, quantity: 4, category: 'لنز' },
  { name: '۲۴-۷۰ سونی', price: 450000, quantity: 4, category: 'لنز' },
  { name: '۳۵ سونی', price: 400000, quantity: 4, category: 'لنز' },
  { name: '۷۰-۲۰۰ سونی', price: 550000, quantity: 4, category: 'لنز' },
  { name: 'فورزا ۳۰۰ بی', price: 400000, quantity: 6, category: 'نورپردازی' },
  { name: 'فورزا ۵۰۰ بی', price: 500000, quantity: 6, category: 'نورپردازی' },
  { name: 'فورزا ۳۰۰ سی', price: 500000, quantity: 6, category: 'نورپردازی' },
  { name: 'فورزا ۵۰۰ سی', price: 600000, quantity: 6, category: 'نورپردازی' },
  { name: 'میکروفون یقه ایی', price: 180000, quantity: 10, category: 'صدابرداری' },
  { name: 'میکروفون دستی', price: 180000, quantity: 10, category: 'صدابرداری' },
  { name: 'رکوردر زوم ۶', price: 200000, quantity: 5, category: 'صدابرداری' },
  { name: 'رکوردر زوم ۸', price: 300000, quantity: 5, category: 'صدابرداری' },
  { name: 'ساچلر', price: 200000, quantity: 10, category: 'پایه' },
  { name: 'بنرو', price: 170000, quantity: 5, category: 'پایه' },
  { name: 'سه پایه نور', price: 20000, quantity: 20, category: 'پایه' },
  { name: 'پایه سنگین', price: 200000, quantity: 10, category: 'پایه' }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  await Product.deleteMany();
  await Admin.deleteMany();
  await User.deleteMany();

  for (let i = 0; i < products.length; i++) {
    products[i].productId = i + 1;
  }
  await Product.insertMany(products);

  const adminPassword = await bcrypt.hash('1234567', 10);
  await Admin.create({ username: 'admin01', passwordHash: adminPassword, adminId: 1 });

  const userPassword = await bcrypt.hash('m12345', 10);
  await User.create({
    firstName: 'محمد حسین',
    lastName: 'نعمتیان',
    nationalId: '0372329888',
    phone: '09123456789',
    referrerCode: 'a0dm1n',
    myCode: randomCode(),
    passwordHash: userPassword,
    status: 'approved'
  });

  console.log('Seed complete');
  process.exit(0);
}


module.exports = seed;

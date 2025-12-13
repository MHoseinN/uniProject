require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/database');

// ایجاد برنامه Express
const app = express();

// اتصال به دیتابیس
connectDB();

// تنظیمات middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// تنظیمات session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 ساعت
  }
}));

// تنظیم view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const professorRoutes = require('./routes/professor');
const managerRoutes = require('./routes/manager');

// صفحه اصلی
app.get('/', (req, res) => {
  if (req.session.user) {
    // اگر لاگین بود، به داشبورد مربوطه هدایت شود
    const role = req.session.user.role;
    return res.redirect(`/${role}/dashboard`);
  }
  res.render('index');
});

// استفاده از routes
app.use('/', authRoutes);
app.use('/student', studentRoutes);
app.use('/professor', professorRoutes);
app.use('/manager', managerRoutes);

// مدیریت خطاها - 404
app.use((req, res) => {
  res.status(404).send('صفحه مورد نظر یافت نشد');
});

// مدیریت خطاها - Server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('خطای سرور');
});

// راه‌اندازی سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سرور روی پورت ${PORT} در حال اجرا است`);
  console.log(`http://localhost:${PORT}`);
});

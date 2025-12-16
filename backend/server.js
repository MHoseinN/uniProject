require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// ایجاد برنامه Express
const app = express();

// اتصال به دیتابیس
connectDB();

// تنظیم CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// تنظیمات middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const professorRoutes = require('./routes/professor');
const headRoutes = require('./routes/headOfDepartment');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');

// صفحه اصلی (API Health Check)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'University Project Management API',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// استفاده از routes با prefix /api
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/head', headRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

// مدیریت خطاها - 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'مسیر API مورد نظر یافت نشد'
  });
});

// مدیریت خطاها - Server errors
app.use((err, req, res, next) => {
  console.error('خطای سرور:', err);
  
  // خطای validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'خطای اعتبارسنجی داده',
      errors: err.errors
    });
  }
  
  // خطای JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'توکن نامعتبر است'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'توکن منقضی شده است'
    });
  }
  
  // خطای عمومی
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'خطای سرور',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// راه‌اندازی سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ سرور در حال اجرا: http://localhost:${PORT}`);
  console.log(`✓ محیط: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ دیتابیس: ${process.env.MONGODB_URI ? 'متصل' : 'در حال اتصال...'}`);
});

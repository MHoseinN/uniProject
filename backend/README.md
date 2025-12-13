# Backend - سیستم مدیریت پروژه دانشجویی

Backend با Node.js، Express و MongoDB

## ساختار

```
backend/
├── config/
│   └── database.js          # اتصال به MongoDB
├── controllers/
│   ├── authController.js    # احراز هویت
│   ├── studentController.js # عملیات دانشجو
│   ├── professorController.js # عملیات استاد
│   └── managerController.js # عملیات مدیر
├── middleware/
│   └── auth.js              # میدلورهای احراز هویت
├── models/
│   ├── Student.js
│   ├── Professor.js
│   ├── Manager.js
│   ├── Project.js
│   ├── DefenseTimeSlot.js
│   └── Message.js
├── routes/
│   ├── auth.js
│   ├── student.js
│   ├── professor.js
│   └── manager.js
├── views/                   # EJS templates (اختیاری)
├── public/                  # فایل‌های استاتیک
├── server.js                # فایل اصلی
├── .env                     # متغیرهای محیطی
└── package.json
```

## نصب

```bash
cd backend
npm install
```

## تنظیمات

فایل `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/uniProject
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
```

## اجرا

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

مستندات کامل در [README.md](../README.md) اصلی

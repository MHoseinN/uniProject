# 🎓 سیستم مدیریت پایان‌نامه دانشگاه

> سیستم جامع مدیریت پایان‌نامه با احراز هویت JWT، کنترل دسترسی مبتنی بر نقش و Audit Logging

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-brightgreen.svg)](https://vuejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-success.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📋 فهرست مطالب

- [معرفی](#-معرفی)
- [ویژگی‌ها](#-ویژگی‌ها)
- [تکنولوژی‌ها](#-تکنولوژی‌ها)
- [نصب و راه‌اندازی](#-نصب-و-راه‌اندازی)
- [ساختار پروژه](#-ساختار-پروژه)
- [نقش‌های کاربری](#-نقش‌های-کاربری)
- [مستندات](#-مستندات)
- [API Endpoints](#-api-endpoints)
- [لایسنس](#-لایسنس)

## 🎯 معرفی

**سیستم مدیریت پایان‌نامه دانشگاه** یک پلتفرم جامع برای مدیریت کامل فرآیند پایان‌نامه است که شامل:
- مدیریت موضوعات پایان‌نامه
- تخصیص پروژه‌ها به دانشجویان
- ارسال و بررسی گزارش‌ها
- زمان‌بندی جلسات دفاع
- نمره‌دهی و ارزیابی
- سیستم پیام‌رسانی داخلی

## ✨ ویژگی‌ها

### امنیت و احراز هویت
- 🔐 **JWT Authentication** - توکن‌های 7 روزه
- 🔒 **bcrypt Password Hashing** - با 10 rounds
- 👥 **Role-Based Access Control** - 4 نقش کاربری
- 📝 **Audit Logging** - ثبت تمام اقدامات حیاتی
- 🛡️ **Input Validation** - اعتبارسنجی کامل ورودی‌ها

### قابلیت‌های Backend
- ✅ API های RESTful استاندارد (40+ endpoint)
- ✅ مدیریت کاربران و نقش‌ها
- ✅ مدیریت ترم‌ها و پروژه‌ها
- ✅ سیستم پیام‌رسانی
- ✅ آپلود و مدیریت فایل
- ✅ گزارش‌گیری و آمار

### قابلیت‌های Frontend
- 🎨 رابط کاربری زیبا با TailwindCSS
- 🌐 پشتیبانی کامل از RTL و فارسی
- 📱 طراحی Responsive
- ⚡ عملکرد بهینه با Vite
- 🔄 مدیریت State با Pinia
- 🚀 Lazy Loading برای صفحات

## 🛠️ تکنولوژی‌ها

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.21.2
- **Database:** MongoDB + Mongoose 8.9.4
- **Authentication:** JWT (jsonwebtoken 9.0.2) + bcrypt 5.1.1
- **File Upload:** Multer 1.4.5-lts.1
- **Logging:** Winston
- **Dev Tools:** Nodemon 3.1.9

### Frontend
- **Framework:** Vue 3.5.13 (Composition API)
- **State Management:** Pinia 2.3.1 + Persistence Plugin
- **Routing:** Vue Router 4.5.0
- **HTTP Client:** Axios 1.7.9
- **Styling:** TailwindCSS 4.0.4 (RTL)
- **Form Validation:** Vee-Validate 4.14.8 + Yup 1.6.5
- **Build Tool:** Vite 6.0.7
- **Font:** Vazirmatn (Persian)

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها
```bash
Node.js 18+
MongoDB 5+
npm یا yarn
```

### 1. Clone کردن پروژه
```bash
git clone https://github.com/MHoseinN/uniProject.git
cd uniProject
```

### 2. نصب Backend
```bash
cd backend
npm install

# کپی کردن و تنظیم متغیرهای محیطی
cp .env.example .env
# ویرایش .env و تنظیم:
# - MONGODB_URI=mongodb://localhost:27017/university-thesis
# - JWT_SECRET=your-secret-key-here
# - PORT=3000

# ایجاد کاربر Admin اولیه
node scripts/create-admin.js

# اجرای سرور
npm start
```

Server: http://localhost:3000

### 3. نصب Frontend
```bash
cd ../frontend
npm install

# تنظیم متغیرهای محیطی
# ویرایش .env و تنظیم:
# VITE_API_URL=http://localhost:3000/api

# اجرای Development Server
npm run dev
```

App: http://localhost:5173

### 4. Build برای Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
# فایل‌های build شده در: frontend/dist/
```

## 📁 ساختار پروژه

```
uniProject/
├── backend/                      # Backend با Node.js + Express
│   ├── controllers/             # کنترلرها (10 فایل)
│   ├── models/                  # مدل‌های Mongoose (5 فایل)
│   ├── routes/                  # مسیرهای API (8 فایل)
│   ├── middleware/              # میدلور JWT
│   ├── utils/                   # ابزارها (jwt, logger, upload)
│   ├── validators/              # اعتبارسنجی
│   ├── scripts/                 # اسکریپت‌ها
│   ├── uploads/                 # فایل‌های آپلود شده
│   ├── server.js               # Entry point
│   └── package.json            # Dependencies
│
├── frontend/                    # Frontend با Vue 3
│   ├── src/
│   │   ├── layouts/           # لی‌اوت‌ها (4 فایل)
│   │   ├── views/             # صفحات (27 فایل)
│   │   │   ├── admin/        # صفحات ادمین
│   │   │   ├── auth/         # احراز هویت
│   │   │   ├── common/       # مشترک
│   │   │   ├── head/         # رئیس گروه
│   │   │   ├── professor/    # استاد
│   │   │   └── student/      # دانشجو
│   │   ├── router/           # Vue Router
│   │   ├── stores/           # Pinia Stores
│   │   ├── services/         # API Services
│   │   └── utils/            # کمکی
│   └── package.json
│
└── docs/                        # مستندات (8 فایل)
```

## 👥 نقش‌های کاربری

### 1. 👨‍💼 Admin (مدیر سیستم)
- مدیریت تمام کاربران
- تغییر نقش‌ها
- مشاهده Audit Logs
- حذف کاربران

### 2. 👔 Head of Department (رئیس گروه)
- مدیریت ترم‌ها
- تعیین ظرفیت اساتید
- تخصیص پروژه‌ها
- زمان‌بندی دفاع

### 3. 👨‍🏫 Professor (استاد)
- تعریف موضوعات پروژه
- مشاهده پروژه‌های تحت سرپرستی
- تعیین زمان‌های آزاد
- نمره‌دهی

### 4. 🎓 Student (دانشجو)
- انتخاب موضوع
- پیشنهاد موضوع شخصی
- ارسال گزارش
- مشاهده وضعیت و نمرات

## 📚 مستندات

- **[API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - مستندات کامل API
- **[IMPLEMENTATION_SUMMARY.md](backend/IMPLEMENTATION_SUMMARY.md)** - خلاصه پیاده‌سازی
- **[MIGRATION_GUIDE.md](backend/MIGRATION_GUIDE.md)** - راهنمای مهاجرت
- **[QUICKSTART.md](backend/QUICKSTART.md)** - شروع سریع
- **[FRONTEND_GUIDE.md](frontend/FRONTEND_GUIDE.md)** - راهنمای فرانت‌اند
- **[ERROR_FIX_REPORT.md](ERROR_FIX_REPORT.md)** - گزارش رفع خطاها
- **[FRONTEND_COMPLETE_SUMMARY.md](FRONTEND_COMPLETE_SUMMARY.md)** - خلاصه فرانت‌اند
- **[PROJECT_COMPLETE_REPORT.md](PROJECT_COMPLETE_REPORT.md)** - گزارش کامل پروژه

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - ثبت‌نام کاربر جدید
- `POST /api/auth/login` - ورود به سیستم

### Admin
- `GET /api/admin/users` - لیست تمام کاربران
- `PATCH /api/admin/users/:id/role` - تغییر نقش کاربر
- `DELETE /api/admin/users/:id` - حذف کاربر
- `GET /api/admin/audit-logs` - گزارش فعالیت‌ها

### Head of Department
- `POST /api/head/terms` - ایجاد ترم جدید
- `PUT /api/head/terms/:id/capacity` - تنظیم ظرفیت
- `POST /api/head/projects/:id/assign` - تخصیص پروژه
- `POST /api/head/defenses` - زمان‌بندی دفاع
- و بیشتر...

### Professor
- `POST /api/professor/topics` - ایجاد موضوع
- `GET /api/professor/projects` - پروژه‌های من
- `POST /api/professor/defense-times` - تعیین زمان
- `PATCH /api/professor/projects/:id/grade` - نمره‌دهی
- و بیشتر...

### Student
- `POST /api/student/projects/request` - درخواست پروژه
- `POST /api/student/projects/propose` - پیشنهاد موضوع
- `POST /api/student/projects/:id/report` - ارسال گزارش
- `GET /api/student/projects/status` - وضعیت پروژه
- و بیشتر...

### Messages
- `POST /api/messages` - ارسال پیام
- `GET /api/messages/inbox` - دریافت پیام‌ها
- `PATCH /api/messages/:id/read` - خواندن پیام

**مجموع:** 40+ endpoint

## 🧪 تست

### تست Backend
```bash
cd backend
npm start
# سرور باید روی پورت 3000 اجرا شود
```

### تست Frontend
```bash
cd frontend
npm run build
# Build موفق: ✓ built in 562ms
```

## 👨‍💻 کاربر پیش‌فرض

بعد از اجرای `node scripts/create-admin.js`:

```
Email: admin@university.edu
Password: Admin@123
Role: admin
```

**⚠️ مهم:** بعد از اولین ورود حتماً رمز را تغییر دهید.

## 📊 آمار پروژه

- **کل فایل‌ها:** 83 (بدون node_modules)
- **Backend:** 37 فایل
- **Frontend:** 31 فایل
- **مستندات:** 8 فایل
- **API Endpoints:** 40+
- **Commits:** 9
- **نقش‌های کاربری:** 4

## 🤝 مشارکت

این پروژه برای اهداف آموزشی توسعه داده شده است. برای مشارکت:

1. Fork کنید
2. Branch جدید بسازید (`git checkout -b feature/AmazingFeature`)
3. Commit کنید (`git commit -m 'Add some AmazingFeature'`)
4. Push کنید (`git push origin feature/AmazingFeature`)
5. Pull Request باز کنید

## 📝 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## 📧 تماس

**Developer:** MHoseinN  
**Repository:** [github.com/MHoseinN/uniProject](https://github.com/MHoseinN/uniProject)

---

<div align="center">

**ساخته شده با ❤️ برای دانشگاه‌های ایران**

⭐ اگر این پروژه مفید بود، لطفاً یک ستاره بدهید!

</div>

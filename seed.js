const path = require('path');
const { createRequire } = require('module');

const backendDir = path.join(__dirname, 'backend');
const backendRequire = createRequire(path.join(backendDir, 'package.json'));
const mongoose = backendRequire('mongoose');

// بارگذاری .env از پوشه backend در صورت وجود
backendRequire('dotenv').config({ path: path.join(backendDir, '.env') });

// Import models using the same backend mongoose instance
const Student = backendRequire('./models/Student');
const Professor = backendRequire('./models/Professor');
const Manager = backendRequire('./models/Manager');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniProject';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      maxPoolSize: 10,
      minPoolSize: 2,
      family: 4,
    });
    // Ensure the connection is ready before seeding
    await mongoose.connection.db.admin().ping();
    console.log('✓ MongoDB متصل شد');
  } catch (err) {
    console.error('✗ خطا در اتصال به MongoDB:', err.message);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    // پاک کردن داده‌های قبلی برای reseed تمیز
    await Student.deleteMany({});
    await Professor.deleteMany({});
    await Manager.deleteMany({});

    // اضافه کردن دانشجو
    const student = await Student.create({
      firstName: 'محمد',
      lastName: 'وفایی',
      nationalCode: '0372199984',
      studentNumber: '99101241',
      major: 'کامپیوتر'
    });
    console.log('✓ دانشجو اضافه شد:', student.firstName, student.lastName);

    // اضافه کردن استاد
    const professor = await Professor.create({
      firstName: 'مهدی',
      lastName: 'رشتی',
      nationalCode: '0371234567',
      professorId: '123456789',
      major: 'کامپیوتر'
    });
    console.log('✓ استاد اضافه شد:', professor.firstName, professor.lastName);

    // اضافه کردن مدیر گروه
    const manager = await Manager.create({
      firstName: 'علی',
      lastName: 'صحفی',
      nationalCode: '0377654321',
      managerId: '987654321',
      major: 'کامپیوتر'
    });
    console.log('✓ مدیر گروه اضافه شد:', manager.firstName, manager.lastName);

    console.log('\n✓ تمام داده‌های پیش‌فرض با موفقیت اضافه شدند!');
    console.log('\n📝 اطلاعات ورود:\n');
    console.log('👨‍🎓 دانشجو:');
    console.log('  کد ملی (نام کاربری): 0372199984');
    console.log('  شماره دانشجویی (رمز عبور): 99101241\n');
    console.log('👨‍🏫 استاد:');
    console.log('  کد ملی (نام کاربری): 0371234567');
    console.log('  شماره شناسایی (رمز عبور): 123456789\n');
    console.log('👔 مدیر گروه:');
    console.log('  کد ملی (نام کاربری): 0377654321');
    console.log('  شماره شناسایی (رمز عبور): 987654321\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.error('✗ خطا: این داده‌ها قبلاً در دیتابیس وجود دارند');
      console.log('\nاگر می‌خواهید داده‌های جدید اضافه کنید، ابتدا دیتابیس را پاک کنید');
    } else {
      console.error('✗ خطا در اضافه کردن داده‌ها:', error.message);
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

// اجرای seed
connectDB().then(seedDatabase);

/**
 * Admin User Creation Script
 * 
 * Creates the first admin user for the system.
 * Run this once after initial setup.
 * 
 * Usage: node scripts/create-admin.js
 */

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('🔧 اتصال به دیتابیس...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ متصل شد\n');

    // Import User model
    const User = require('../models/User');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin', isActive: true });
    if (existingAdmin) {
      console.log('⚠️  یک ادمین فعال در سیستم وجود دارد:');
      console.log(`   نام: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`   ایمیل: ${existingAdmin.email}\n`);
      
      const proceed = await question('آیا می‌خواهید ادمین جدید ایجاد کنید? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
        console.log('لغو شد.');
        process.exit(0);
      }
    }

    console.log('📝 ایجاد ادمین جدید:\n');

    // Get admin details
    const firstName = await question('نام: ') || 'مدیر';
    const lastName = await question('نام خانوادگی: ') || 'سیستم';
    const email = await question('ایمیل: ') || 'admin@university.edu';
    const password = await question('رمز عبور: ') || 'Admin123';

    console.log('\n⏳ در حال ایجاد ادمین...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      isActive: true
    });

    console.log('\n✅ ادمین با موفقیت ایجاد شد!');
    console.log('\n📄 اطلاعات ادمین:');
    console.log(`   ID: ${admin._id}`);
    console.log(`   نام: ${admin.firstName} ${admin.lastName}`);
    console.log(`   ایمیل: ${admin.email}`);
    console.log(`   نقش: ${admin.role}`);
    console.log(`   تأیید شده: ${admin.isApproved ? 'بله' : 'خیر'}`);
    console.log(`   فعال: ${admin.isActive ? 'بله' : 'خیر'}`);
    
    console.log('\n🔐 برای ورود از این اطلاعات استفاده کنید:');
    console.log(`   ایمیل: ${email}`);
    console.log(`   رمز عبور: ${password}`);

    console.log('\n💡 دستور ورود با cURL:');
    console.log(`curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "${email}",
    "password": "${password}"
  }'`);

  } catch (error) {
    console.error('❌ خطا در ایجاد ادمین:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
}

// Run
createAdmin();

# 🚀 Quick Start Guide - Production Backend

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

---

## Installation (5 minutes)

### 1. Navigate to Backend Directory
```bash
cd /workspaces/uniProject/backend
```

### 2. Install Dependencies (Already Done)
```bash
# Dependencies already installed:
# - express, mongoose, cors, dotenv
# - jsonwebtoken, bcrypt
# - multer, express-validator
# - winston, uuid
```

### 3. Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Minimum required configuration:**
```env
MONGODB_URI=mongodb://localhost:27017/university_project_db
JWT_SECRET=change-this-to-a-random-32-character-string
```

### 4. Start MongoDB
```bash
# Option 1: Local MongoDB
mongod --dbpath /path/to/data

# Option 2: MongoDB in Docker
docker run -d -p 27017:27017 --name mongo mongo:latest

# Option 3: MongoDB Atlas (cloud)
# Use connection string in .env
```

### 5. Start Server
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

**Expected output:**
```
✓ سرور در حال اجرا: http://localhost:3000
✓ محیط: development
✓ دیتابیس: متصل
```

---

## Testing the API (10 minutes)

### Health Check
```bash
curl http://localhost:3000/
```

**Expected response:**
```json
{
  "success": true,
  "message": "University Project Management API",
  "version": "2.0.0",
  "environment": "development"
}
```

---

## Complete Workflow Test

### Step 1: Create Admin User (Direct MongoDB)
```javascript
// Connect to MongoDB shell
mongosh university_project_db

// Insert admin user
db.users.insertOne({
  firstName: "مدیر",
  lastName: "سیستم",
  email: "admin@university.edu",
  password: "$2b$10$YourBcryptHashedPasswordHere", // Use bcrypt.hash("Admin123", 10)
  role: "admin",
  isApproved: true,
  isActive: true,
  createdAt: new Date()
})
```

**OR use this Node.js script:**
```javascript
// create-admin.js
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = require('./models/User');
  
  const hashedPassword = await bcrypt.hash('Admin123', 10);
  
  const admin = await User.create({
    firstName: 'مدیر',
    lastName: 'سیستم',
    email: 'admin@university.edu',
    password: hashedPassword,
    role: 'admin',
    isApproved: true,
    isActive: true
  });
  
  console.log('✓ Admin created:', admin.email);
  process.exit(0);
}

createAdmin();
```

Run: `node create-admin.js`

### Step 2: Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "Admin123"
  }'
```

**Save the token from response!**

### Step 3: Register Head of Department
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "دکتر",
    "lastName": "احمدی",
    "email": "head@cs.university.edu",
    "password": "Head123",
    "role": "head_of_department",
    "professorId": "HoD001"
  }'
```

### Step 4: Admin Approves Head
```bash
curl -X POST http://localhost:3000/api/admin/users/USER_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Step 5: Head Logs In
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "head@cs.university.edu",
    "password": "Head123"
  }'
```

### Step 6: Head Creates Term
```bash
curl -X POST http://localhost:3000/api/head/terms \
  -H "Authorization: Bearer HEAD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "نیمسال اول 1403-1404",
    "startDate": "2024-09-23",
    "endDate": "2025-02-20",
    "capacities": [
      {"major": "کامپیوتر", "maxProjects": 50},
      {"major": "برق", "maxProjects": 40}
    ]
  }'
```

### Step 7: Register Professor
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "دکتر",
    "lastName": "محمدی",
    "email": "prof.mohammadi@university.edu",
    "password": "Prof123",
    "role": "professor",
    "professorId": "P001"
  }'
```

### Step 8: Admin Approves Professor
```bash
curl -X POST http://localhost:3000/api/admin/users/PROFESSOR_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Step 9: Register Student
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "علی",
    "lastName": "رضایی",
    "email": "ali.rezaei@student.university.edu",
    "password": "Student123",
    "role": "student",
    "studentNumber": "401234567",
    "major": "کامپیوتر"
  }'
```

### Step 10: Admin Approves Student
```bash
curl -X POST http://localhost:3000/api/admin/users/STUDENT_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Step 11: Student Logs In & Requests Project
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ali.rezaei@student.university.edu",
    "password": "Student123"
  }'

# Request Project
curl -X POST http://localhost:3000/api/student/request-project \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### Step 12: Head Approves Project
```bash
# Get pending projects
curl http://localhost:3000/api/head/pending-projects \
  -H "Authorization: Bearer HEAD_TOKEN"

# Approve
curl -X POST http://localhost:3000/api/head/projects/PROJECT_ID/approve \
  -H "Authorization: Bearer HEAD_TOKEN"
```

### Step 13: Head Assigns Supervisors
```bash
curl -X POST http://localhost:3000/api/head/assign-supervisors \
  -H "Authorization: Bearer HEAD_TOKEN"
```

### Step 14: Student Proposes Topic
```bash
curl -X POST http://localhost:3000/api/student/propose-topic \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic": "سیستم هوشمند مدیریت دانشگاه با یادگیری ماشین"}'
```

### Step 15: Professor Approves Topic
```bash
# Professor logs in
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prof.mohammadi@university.edu",
    "password": "Prof123"
  }'

# View proposed topics
curl http://localhost:3000/api/professor/projects/PROJECT_ID/proposed-topics \
  -H "Authorization: Bearer PROFESSOR_TOKEN"

# Approve topic (index 0)
curl -X POST http://localhost:3000/api/professor/projects/PROJECT_ID/approve-topic \
  -H "Authorization: Bearer PROFESSOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topicIndex": 0}'
```

**Continue with remaining workflow (assign examiners, submit reports, schedule defense, grade)...**

---

## Monitoring & Debugging

### View Audit Logs
```bash
curl http://localhost:3000/api/admin/logs?limit=50 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### View Statistics
```bash
curl http://localhost:3000/api/head/statistics \
  -H "Authorization: Bearer HEAD_TOKEN"
```

### Check Server Logs
```bash
# Server outputs to console
tail -f server.log
```

---

## Common Issues & Solutions

### Issue 1: "mongodb connection error"
**Solution**: Ensure MongoDB is running and `MONGODB_URI` in `.env` is correct.

### Issue 2: "jwt must be provided"
**Solution**: Include `Authorization: Bearer <token>` header in requests.

### Issue 3: "user not approved"
**Solution**: Admin must approve new users via `/api/admin/users/:id/approve`.

### Issue 4: "ظرفیت پروژه تکمیل شده"
**Solution**: Head must increase capacity via `/api/head/terms/:id/capacity`.

### Issue 5: "file upload failed"
**Solution**: Ensure `uploads/reports/` directory exists and is writable.

---

## Production Deployment Checklist

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use MongoDB Atlas (cloud) instead of local
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up reverse proxy (nginx)
- [ ] Configure CORS for production frontend URL
- [ ] Set up log rotation (winston)
- [ ] Enable rate limiting (express-rate-limit)
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure backups for MongoDB
- [ ] Set up CI/CD pipeline
- [ ] Add email notifications (nodemailer)
- [ ] Enable file virus scanning
- [ ] Set up CDN for static files

---

## Development Tools

### Postman Collection
Import API endpoints for easy testing:
- Base URL: `http://localhost:3000/api`
- Environment: `{{baseUrl}}`, `{{token}}`

### MongoDB Compass
Visual MongoDB client:
- Connection: `mongodb://localhost:27017`
- Database: `university_project_db`
- Collections: `users`, `projects`, `terms`, `auditlogs`, `messages`

### VS Code Extensions
- REST Client (test APIs in .http files)
- MongoDB for VS Code
- Thunder Client (Postman alternative)

---

## Support & Resources

📖 **Full API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)  
📊 **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)  
🔧 **Environment Template**: [.env.example](./.env.example)

**Status**: ✅ Production Ready  
**Version**: 2.0.0  
**Last Updated**: February 2024

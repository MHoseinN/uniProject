# Production Backend API Documentation

## نمای کلی سیستم

سیستم مدیریت پروژه‌های دانشگاهی با معماری RESTful API، احراز هویت JWT، و کنترل دسترسی مبتنی بر نقش.

## معماری

### Technology Stack
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Password Security**: bcrypt (10 salt rounds)
- **File Upload**: multer (20MB limit, PDF/DOC only)
- **Logging**: Custom AuditLog system
- **Validation**: express-validator

### Project Structure
```
backend/
├── config/
│   └── database.js              # MongoDB connection
├── models/
│   ├── User.js                  # Unified user model (all roles)
│   ├── Project.js               # Project workflow management
│   ├── Term.js                  # Academic term + capacity
│   ├── AuditLog.js             # Comprehensive audit trail
│   └── Inbox.js                 # Messaging system
├── controllers/
│   ├── authController.js        # Register, Login, Profile
│   ├── studentController.js     # Student workflows
│   ├── professorController.js   # Professor workflows
│   ├── headOfDepartmentController.js  # Head workflows + algorithms
│   ├── adminController.js       # User approval + logs
│   └── messagingController.js   # Inbox/Messaging
├── middleware/
│   └── jwt.js                   # authenticate, authorize
├── utils/
│   ├── jwt.js                   # Token generation/verification
│   ├── logger.js                # Audit logging service
│   └── upload.js                # File upload configuration
├── validators/
│   └── index.js                 # Input validation rules
├── routes/
│   ├── auth.js                  # /api/auth
│   ├── student.js               # /api/student
│   ├── professor.js             # /api/professor
│   ├── headOfDepartment.js      # /api/head
│   ├── admin.js                 # /api/admin
│   └── messages.js              # /api/messages
└── uploads/
    └── reports/                 # Student report files
```

---

## User Roles & Permissions

### 1. Student (دانشجو)
- درخواست اخذ پروژه
- پیشنهاد موضوعات
- ارسال گزارش‌های پیشرفت
- مشاهده نمره نهایی

### 2. Professor (استاد)
- مشاهده پروژه‌های راهنمایی و داوری
- تأیید موضوع پروژه (راهنما)
- ارسال زمان‌های دفاع (داور)
- ثبت نمره نهایی (داور)

### 3. Head of Department (مدیر گروه)
- تعریف ترم و تنظیم ظرفیت
- تأیید درخواست‌های پروژه
- تخصیص خودکار اساتید (الگوریتم عادلانه)
- زمان‌بندی دفاع‌ها (بدون تداخل)

### 4. Admin (مدیر سیستم)
- تأیید/رد کاربران جدید
- مشاهده لاگ‌های سیستم
- مدیریت کاربران

---

## API Endpoints

### 🔐 Authentication (`/api/auth`)

#### Register (ثبت‌نام)
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "علی",
  "lastName": "احمدی",
  "email": "ali@example.com",
  "password": "SecurePass123",
  "role": "student",
  "studentNumber": "401234567",  // برای student
  "professorId": "12345",        // برای professor
  "major": "کامپیوتر"             // برای student
}

Response: 201 Created
{
  "success": true,
  "message": "ثبت‌نام موفق. منتظر تأیید مدیر باشید.",
  "user": { ... }
}
```

#### Login (ورود)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ali@example.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "success": true,
  "message": "ورود موفق",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "firstName": "علی",
    "lastName": "احمدی",
    "role": "student",
    "email": "ali@example.com"
  }
}
```

#### Get Profile (دریافت پروفایل)
```http
GET /api/auth/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "user": { ... }
}
```

---

### 🎓 Student Endpoints (`/api/student`)

**All endpoints require**: `Authorization: Bearer <token>` + role: `student`

#### Dashboard
```http
GET /api/student/dashboard

Response:
{
  "success": true,
  "student": { ... },
  "project": { ... },  // پروژه فعال یا null
  "term": { ... }      // ترم فعال
}
```

#### Request Project
```http
POST /api/student/request-project

Response: 201 Created
{
  "success": true,
  "message": "درخواست پروژه ثبت شد",
  "project": { ... }
}
```

#### Propose Topic
```http
POST /api/student/propose-topic
Content-Type: application/json

{
  "topic": "سیستم هوشمند مدیریت انبار با الگوریتم‌های بهینه‌سازی"
}

Response: 200 OK
```

#### Submit Report
```http
POST /api/student/submit-report
Content-Type: multipart/form-data

content: "گزارش پیشرفت هفته اول..."
file: [binary PDF/DOC file]

Response: 200 OK
{
  "success": true,
  "message": "گزارش ثبت شد",
  "report": { ... }
}
```

#### Final Status
```http
GET /api/student/final-status

Response:
{
  "success": true,
  "project": {
    "projectCode": "PRJ-001",
    "topic": "...",
    "status": "completed",
    "grade": 18.5,
    "defenseDate": "2024-06-15",
    ...
  }
}
```

---

### 👨‍🏫 Professor Endpoints (`/api/professor`)

**All endpoints require**: `Authorization: Bearer <token>` + role: `professor`

#### Get Projects
```http
GET /api/professor/projects?role=supervisor

Response:
{
  "success": true,
  "count": 5,
  "projects": [ ... ]
}
```

#### Get Proposed Topics
```http
GET /api/professor/projects/:projectId/proposed-topics

Response:
{
  "success": true,
  "project": {
    "id": "...",
    "student": { ... },
    "proposedTopics": [
      {
        "topic": "...",
        "proposedAt": "2024-02-10",
        "status": "pending"
      }
    ]
  }
}
```

#### Approve Topic
```http
POST /api/professor/projects/:projectId/approve-topic
Content-Type: application/json

{
  "topicIndex": 0
}

Response: 200 OK
{
  "success": true,
  "message": "موضوع تأیید شد",
  "project": { ... }
}
```

#### Submit Defense Times
```http
POST /api/professor/projects/:projectId/defense-times
Content-Type: application/json

{
  "times": [
    {
      "date": "2024-06-10",
      "startTime": "10:00",
      "endTime": "10:30"
    },
    {
      "date": "2024-06-11",
      "startTime": "14:00",
      "endTime": "14:30"
    }
  ]
}

Response: 200 OK
```

#### Grade Project
```http
POST /api/professor/projects/:projectId/grade
Content-Type: application/json

{
  "grade": 18.5
}

Response: 200 OK
{
  "success": true,
  "message": "نمره ثبت شد",
  "project": { ... }
}
```

#### Get Project Reports
```http
GET /api/professor/projects/:projectId/reports

Response:
{
  "success": true,
  "project": {
    "projectCode": "PRJ-001",
    "student": { ... },
    "reports": [ ... ]
  }
}
```

---

### 🏛️ Head of Department Endpoints (`/api/head`)

**All endpoints require**: `Authorization: Bearer <token>` + role: `head_of_department`

#### Create Term
```http
POST /api/head/terms
Content-Type: application/json

{
  "name": "نیمسال اول 1403-1404",
  "startDate": "2024-09-23",
  "endDate": "2025-02-20",
  "capacities": [
    { "major": "کامپیوتر", "maxProjects": 50 },
    { "major": "برق", "maxProjects": 40 }
  ]
}

Response: 201 Created
```

#### Set Capacity
```http
PUT /api/head/terms/:termId/capacity
Content-Type: application/json

{
  "capacities": [
    { "major": "کامپیوتر", "maxProjects": 60 }
  ]
}
```

#### Set Examiner Limits
```http
POST /api/head/examiner-limits
Content-Type: application/json

{
  "professorId": "...",
  "maxExaminees": 10
}
```

#### Get Pending Projects
```http
GET /api/head/pending-projects

Response:
{
  "success": true,
  "count": 12,
  "projects": [ ... ]
}
```

#### Approve Project
```http
POST /api/head/projects/:projectId/approve

Response: 200 OK
{
  "success": true,
  "message": "پروژه تأیید شد",
  "project": { ... }
}
```

#### Assign Supervisors (Fair Distribution Algorithm)
```http
POST /api/head/assign-supervisors

Response:
{
  "success": true,
  "message": "15 پروژه به اساتید تخصیص یافت",
  "assignments": [
    {
      "projectId": "...",
      "student": { ... },
      "supervisor": { ... }
    }
  ]
}
```

**Algorithm**: Round-robin based on `currentSupervisees` count. Always assigns to professor with fewest students for fair distribution.

#### Assign Examiners
```http
POST /api/head/assign-examiners

Response: 200 OK
```

**Constraints**:
- Examiner ≠ Supervisor
- Respects `maxExaminees` limit
- Distributes fairly based on `currentExaminees`

#### Schedule Defenses (Conflict-Free Algorithm)
```http
POST /api/head/schedule-defenses

Response:
{
  "success": true,
  "message": "8 دفاع زمان‌بندی شد",
  "scheduled": [ ... ]
}
```

**Algorithm**: Iterates proposed times, checks for conflicts in `professorSchedules` map, selects first conflict-free slot.

#### Get Statistics
```http
GET /api/head/statistics

Response:
{
  "success": true,
  "statistics": {
    "term": "نیمسال اول 1403-1404",
    "projects": {
      "total": 45,
      "pending": 5,
      "approved": 10,
      "inProgress": 25,
      "completed": 5
    },
    "users": {
      "professors": 15,
      "students": 120
    },
    "capacities": [ ... ]
  }
}
```

---

### 👔 Admin Endpoints (`/api/admin`)

**All endpoints require**: `Authorization: Bearer <token>` + role: `admin`

#### Get Pending Users
```http
GET /api/admin/pending-users

Response:
{
  "success": true,
  "count": 8,
  "users": [ ... ]
}
```

#### Approve User
```http
POST /api/admin/users/:userId/approve

Response: 200 OK
{
  "success": true,
  "message": "کاربر تأیید شد"
}
```

#### Reject User
```http
POST /api/admin/users/:userId/reject

Response: 200 OK
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=20&role=student

Response:
{
  "success": true,
  "users": [ ... ],
  "pagination": { ... }
}
```

#### Get Logs
```http
GET /api/admin/logs?action=PROJECT_APPROVED&startDate=2024-01-01

Response:
{
  "success": true,
  "logs": [ ... ],
  "pagination": { ... }
}
```

---

### 💬 Messaging Endpoints (`/api/messages`)

**All endpoints require**: `Authorization: Bearer <token>`

#### Send Message
```http
POST /api/messages/send
Content-Type: application/json

{
  "to": "USER_ID",
  "subject": "سوال درباره پروژه",
  "content": "متن پیام...",
  "relatedProject": "PROJECT_ID"  // optional
}

Response: 201 Created
```

#### Get Inbox
```http
GET /api/messages/inbox?page=1&limit=20&unreadOnly=true

Response:
{
  "success": true,
  "messages": [ ... ],
  "unreadCount": 5,
  "pagination": { ... }
}
```

#### Get Sent Messages
```http
GET /api/messages/sent?page=1&limit=20

Response: 200 OK
```

#### Mark as Read
```http
PUT /api/messages/:messageId/read

Response: 200 OK
```

#### Delete Message
```http
DELETE /api/messages/:messageId

Response: 200 OK
```

#### Get Conversation
```http
GET /api/messages/conversation/:userId

Response:
{
  "success": true,
  "conversation": {
    "with": { ... },
    "messages": [ ... ]
  }
}
```

#### Get Conversations List
```http
GET /api/messages/conversations

Response:
{
  "success": true,
  "conversations": [
    {
      "user": { ... },
      "lastMessage": { ... },
      "unreadCount": 2
    }
  ]
}
```

---

## Project Status Workflow

```
pending
  ↓ (Head approves)
approved
  ↓ (Head assigns supervisor)
supervisor_assigned
  ↓ (Student proposes topic)
topic_proposal
  ↓ (Supervisor approves)
topic_approved
  ↓ (Head assigns examiner)
in_progress
  ↓ (Examiner submits times + Head schedules)
defense_scheduled
  ↓ (Examiner grades)
completed
```

**Rejection Path**: Any status → `rejected`

---

## Audit Log Actions

System logs 20+ critical actions:
- `USER_REGISTERED`, `USER_APPROVED`, `USER_REJECTED`
- `PROJECT_REQUESTED`, `PROJECT_APPROVED`, `PROJECT_REJECTED`
- `SUPERVISOR_ASSIGNED`, `EXAMINER_ASSIGNED`
- `TOPIC_PROPOSED`, `TOPIC_APPROVED`
- `REPORT_SUBMITTED`
- `DEFENSE_TIMES_SUBMITTED`, `DEFENSE_SCHEDULED`
- `GRADE_SUBMITTED`
- `MESSAGE_SENT`
- `TERM_CREATED`, `CAPACITY_UPDATED`

Each log includes:
- `performedBy` (User ID)
- `action` (enum)
- `targetUser`, `targetProject` (optional)
- `ipAddress`, `userAgent`
- `details` (JSON object)
- `timestamp`

---

## Environment Variables

Create `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/university_project_db

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=20971520  # 20MB in bytes
```

---

## Installation & Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Create .env file (see above)

# 3. Start MongoDB
# (Docker or local installation)

# 4. Run server
npm start

# Development mode with auto-reload
npm run dev
```

---

## Testing Strategy

### Manual Testing with cURL/Postman

**Example: Complete Student Flow**

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "علی",
    "lastName": "احمدی",
    "email": "ali@example.com",
    "password": "Test1234",
    "role": "student",
    "studentNumber": "401234567",
    "major": "کامپیوتر"
  }'

# 2. Admin approves (using admin token)
curl -X POST http://localhost:3000/api/admin/users/USER_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ali@example.com",
    "password": "Test1234"
  }'
# Save the token from response

# 4. Request project
curl -X POST http://localhost:3000/api/student/request-project \
  -H "Authorization: Bearer STUDENT_TOKEN"

# 5. Head approves project
curl -X POST http://localhost:3000/api/head/projects/PROJECT_ID/approve \
  -H "Authorization: Bearer HEAD_TOKEN"

# 6. Propose topic
curl -X POST http://localhost:3000/api/student/propose-topic \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic": "سیستم هوشمند..."}'

# Continue workflow...
```

---

## Security Features

✅ **Password Security**
- bcrypt hashing with 10 salt rounds
- Pre-save hook automatically hashes passwords
- comparePassword method for authentication

✅ **JWT Authentication**
- 7-day expiration (configurable)
- Secure token storage in HTTP headers
- Token verification middleware

✅ **Role-Based Authorization**
- Middleware enforces role permissions
- Prevents privilege escalation

✅ **Input Validation**
- express-validator sanitizes inputs
- Persian error messages
- Prevents injection attacks

✅ **Audit Trail**
- All critical actions logged
- Includes IP address + user agent
- Searchable and filterable

✅ **File Upload Security**
- File type whitelist (PDF/DOC only)
- Size limit (20MB)
- Unique filenames (UUID)

---

## Business Logic Enforcement

### One Active Project Per Student
- Database query checks for existing project in active term
- Status filter excludes rejected/completed projects

### Capacity Management
- Pre-save hook ensures only one active term
- Atomic increment of `currentCount` on project approval
- Validation before approval

### Fair Distribution
- Round-robin algorithm for supervisors
- Always assigns to professor with fewest students
- Re-sorts after each assignment

### Supervisor ≠ Examiner
- Filter excludes supervisor from examiner candidates
- Respects `maxExaminees` limit per professor

### Conflict-Free Defense Scheduling
- Tracks occupied time slots in `professorSchedules` map
- Validates both supervisor and examiner availability
- 30-minute time slots (8:00-15:00)

---

## Known Limitations & Future Work

⚠️ **Current Limitations**:
1. No email notifications (consider nodemailer)
2. No real-time updates (consider Socket.io)
3. No file virus scanning (consider ClamAV)
4. Basic pagination (no cursor-based)
5. No rate limiting (consider express-rate-limit)

🔮 **Future Enhancements**:
1. WebSocket for real-time notifications
2. Email service for important events
3. Advanced search with Elasticsearch
4. PDF report generation
5. Dashboard analytics with charts
6. Mobile app API versioning
7. Dockerized deployment
8. CI/CD pipeline

---

## API Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "عملیات موفق",
  "data": { ... },
  "pagination": { ... }  // if applicable
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "توضیح خطا به فارسی",
  "errors": [ ... ]  // validation errors
}
```

---

## Support & Documentation

**Created**: February 2024  
**Version**: 2.0.0 (Production-Ready)  
**Architecture**: RESTful API with JWT Authentication  
**Language**: JavaScript (Node.js)  

For questions or issues, review the inline code documentation or audit logs.

---

## License

University Project - Educational Purpose

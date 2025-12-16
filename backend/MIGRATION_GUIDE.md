# Migration Guide: Session-based to JWT Production Backend

## Overview

This guide helps you transition from the old session-based backend to the new JWT-authenticated production backend.

---

## Key Architectural Changes

### 1. Authentication System

#### OLD (Session-based)
```javascript
// Login stored user in session
req.session.user = { id, role, ... };

// Check authentication
if (!req.session.user) { redirect('/login'); }
```

#### NEW (JWT-based)
```javascript
// Login returns JWT token
const token = generateToken(user);
res.json({ token, user });

// Check authentication with middleware
router.get('/protected', authenticate, (req, res) => {
  // req.userId and req.user available
});
```

**Migration Steps**:
1. Remove `express-session` and `connect-mongo` dependencies
2. Add `Authorization: Bearer <token>` to all API requests
3. Store token in frontend (localStorage/sessionStorage)
4. Include token in axios/fetch headers

---

### 2. User Model Architecture

#### OLD (Separate Models)
```javascript
// models/Student.js
const Student = mongoose.model('Student', studentSchema);

// models/Professor.js  
const Professor = mongoose.model('Professor', professorSchema);

// models/Manager.js
const Manager = mongoose.model('Manager', managerSchema);
```

#### NEW (Unified Model)
```javascript
// models/User.js
const User = mongoose.model('User', {
  role: { type: String, enum: ['student', 'professor', 'head_of_department', 'admin'] },
  // Role-specific fields
  studentNumber: { type: String, sparse: true },
  professorId: { type: String, sparse: true },
  major: { type: String },
  // ...
});
```

**Migration Steps**:
1. **DO NOT delete old collections yet!** 
2. Create data migration script:

```javascript
// scripts/migrate-users.js
async function migrateUsers() {
  const students = await Student.find();
  const professors = await Professor.find();
  const managers = await Manager.find();
  
  // Migrate students
  for (const student of students) {
    await User.create({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || `${student.nationalCode}@student.edu`,
      password: student.password, // already hashed
      role: 'student',
      studentNumber: student.studentNumber,
      major: student.major,
      isApproved: true,
      isActive: true,
      // Map other fields...
    });
  }
  
  // Migrate professors
  for (const prof of professors) {
    await User.create({
      firstName: prof.firstName,
      lastName: prof.lastName,
      email: prof.email || `${prof.nationalCode}@university.edu`,
      password: prof.password,
      role: 'professor',
      professorId: prof.professorId,
      isApproved: true,
      isActive: true,
      currentSupervisees: 0,
      currentExaminees: 0,
    });
  }
  
  // Migrate managers -> head_of_department
  for (const manager of managers) {
    await User.create({
      firstName: manager.firstName,
      lastName: manager.lastName,
      email: manager.email || `${manager.nationalCode}@head.edu`,
      password: manager.password,
      role: 'head_of_department',
      professorId: manager.professorId || 'HoD001',
      isApproved: true,
      isActive: true,
    });
  }
}
```

3. Run migration: `node scripts/migrate-users.js`
4. Verify: `db.users.countDocuments()` should match total of old collections
5. **After verification**, backup and drop old collections

---

### 3. Project Model Changes

#### OLD
```javascript
{
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
  examiner: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
  // ...
}
```

#### NEW
```javascript
{
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  examiner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  term: { type: mongoose.Schema.Types.ObjectId, ref: 'Term' }, // NEW!
  proposedTopics: [{ topic, proposedAt, status }], // NEW!
  reports: [{ content, fileUrl, submittedAt }], // NEW!
  proposedDefenseTimes: [{ date, startTime, endTime }], // NEW!
  // Enhanced status workflow
  status: { 
    type: String, 
    enum: [
      'pending', 'approved', 'supervisor_assigned', 
      'topic_proposal', 'topic_approved', 'in_progress', 
      'defense_scheduled', 'completed', 'rejected'
    ]
  }
}
```

**Migration Steps**:
```javascript
// scripts/migrate-projects.js
async function migrateProjects() {
  const oldProjects = await Project.find();
  
  for (const project of oldProjects) {
    // Find corresponding users in new User model
    const student = await User.findOne({ 
      role: 'student', 
      studentNumber: project.student.studentNumber 
    });
    
    const supervisor = await User.findOne({ 
      role: 'professor', 
      professorId: project.supervisor?.professorId 
    });
    
    const examiner = await User.findOne({ 
      role: 'professor', 
      professorId: project.examiner?.professorId 
    });
    
    // Update project references
    await Project.updateOne(
      { _id: project._id },
      {
        $set: {
          student: student._id,
          supervisor: supervisor?._id,
          examiner: examiner?._id,
          term: activeTerm._id, // Link to active term
          // Map old status to new workflow
          status: mapOldStatusToNew(project.status)
        }
      }
    );
  }
}

function mapOldStatusToNew(oldStatus) {
  const statusMap = {
    'در انتظار تایید': 'pending',
    'تایید شده': 'approved',
    'در حال انجام': 'in_progress',
    'تکمیل شده': 'completed',
    'رد شده': 'rejected'
  };
  return statusMap[oldStatus] || 'pending';
}
```

---

### 4. Route Changes

#### OLD (Session + Views)
```javascript
// routes/student.js
router.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('student/dashboard', { user: req.session.user });
});

router.post('/request-project', async (req, res) => {
  const studentId = req.session.user.id;
  // ... logic
  res.redirect('/student/dashboard');
});
```

#### NEW (JWT + JSON API)
```javascript
// routes/student.js
router.get('/dashboard', authenticate, authorize('student'), async (req, res) => {
  // req.userId available from JWT middleware
  res.json({
    success: true,
    student: { ... },
    project: { ... }
  });
});

router.post('/request-project', authenticate, authorize('student'), async (req, res) => {
  const studentId = req.userId;
  // ... logic
  res.status(201).json({
    success: true,
    message: 'درخواست ثبت شد',
    project
  });
});
```

**Migration Steps**:
1. Remove all `res.render()` calls
2. Replace with `res.json()` responses
3. Remove all `req.session` usage
4. Add JWT middleware to routes
5. Update frontend to:
   - Store token after login
   - Send token in Authorization header
   - Parse JSON responses

---

### 5. Frontend Integration Changes

#### OLD (Session-based)
```javascript
// Login
fetch('/login/student', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nationalCode, password }),
  credentials: 'include' // Send cookies
}).then(res => {
  if (res.ok) window.location.href = '/student/dashboard';
});

// Authenticated request
fetch('/student/dashboard', {
  credentials: 'include' // Send session cookie
});
```

#### NEW (JWT-based)
```javascript
// Login
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
}).then(res => res.json()).then(data => {
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/dashboard';
  }
});

// Authenticated request
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/student/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(res => res.json()).then(data => {
  // Handle JSON response
});
```

**Migration Steps**:
1. Update login to store JWT token
2. Create axios/fetch interceptor to add Authorization header:

```javascript
// axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Add token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (expired token)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

3. Update all API calls to use JSON responses:

```javascript
// OLD
window.location.href = '/student/dashboard';

// NEW
api.get('/student/dashboard').then(({ data }) => {
  setStudent(data.student);
  setProject(data.project);
});
```

---

### 6. Removed Features (Session-based)

These old features are **NO LONGER USED**:
- ❌ `express-session`
- ❌ `connect-mongo` (session store)
- ❌ EJS views (`res.render()`)
- ❌ Session cookies
- ❌ `/views/` templates
- ❌ Separate Student/Professor/Manager models
- ❌ nationalCode as primary identifier (now use email)

---

### 7. New Features (JWT-based)

✅ JWT authentication with 7-day expiration  
✅ Unified User model with 4 roles  
✅ Term-based project management  
✅ Comprehensive audit logging (20+ action types)  
✅ File upload system (multer)  
✅ Inbox/Messaging system  
✅ Fair distribution algorithms  
✅ Conflict-free scheduling  
✅ Input validation middleware  
✅ Role-based authorization  
✅ RESTful API architecture  
✅ Production-ready error handling

---

## Complete Migration Checklist

### Backend Migration
- [ ] Install new dependencies (`jsonwebtoken`, `bcrypt`, `multer`, `winston`, etc.)
- [ ] Create `.env` file with `JWT_SECRET` and `MONGODB_URI`
- [ ] Run user migration script
- [ ] Run project migration script
- [ ] Create initial admin user
- [ ] Verify all old data migrated correctly
- [ ] Test new API endpoints with Postman/cURL
- [ ] Backup old collections
- [ ] Update deployment scripts

### Frontend Migration
- [ ] Update API base URL (add `/api` prefix)
- [ ] Implement JWT token storage (localStorage)
- [ ] Create axios interceptor for Authorization header
- [ ] Remove session cookie logic
- [ ] Update login/register flows to use email
- [ ] Change all redirects to JSON-based navigation
- [ ] Update error handling for JSON responses
- [ ] Test all user flows (student, professor, head, admin)
- [ ] Handle token expiration (refresh or re-login)

### Database Migration
- [ ] Create Term collection
- [ ] Create AuditLog collection
- [ ] Create Inbox (messages) collection
- [ ] Update Project schema (add term, proposedTopics, reports)
- [ ] Add indexes for performance (email, role, status)
- [ ] Run data migration scripts
- [ ] Verify data integrity
- [ ] Test queries with new schema

### Testing & Validation
- [ ] Complete user registration → approval → login flow
- [ ] Test student workflow (request → topic → report → grade)
- [ ] Test professor workflow (approve topic → defense times → grade)
- [ ] Test head workflow (create term → approve → assign → schedule)
- [ ] Test admin workflow (approve users → view logs)
- [ ] Test messaging system (send → inbox → read → reply)
- [ ] Verify audit logs are created for all actions
- [ ] Test file upload (reports)
- [ ] Test fair distribution algorithms
- [ ] Performance test with 100+ projects

---

## Rollback Plan

If migration fails, you can rollback:

1. **Keep old code in separate branch**:
```bash
git checkout main  # old session-based code
```

2. **Restore old database collections**:
```javascript
// Old collections are still intact (students, professors, managers)
// Just switch back to old models
```

3. **Switch frontend back to session-based API**

**IMPORTANT**: Do NOT delete old collections until new system is fully tested and validated.

---

## Support & Troubleshooting

### Common Issues

**Issue**: "Cannot read property 'role' of undefined"  
**Solution**: User not properly authenticated. Check JWT token is valid.

**Issue**: "Project not found"  
**Solution**: Project references need to be updated to new User IDs. Run migration script.

**Issue**: "Validation error: email is required"  
**Solution**: Old users don't have email. Generate emails during migration or prompt users to add.

---

## Timeline Recommendation

**Week 1**: Backend migration
- Day 1-2: Install dependencies, update models
- Day 3-4: Create migration scripts, test on staging DB
- Day 5: Run migrations, verify data

**Week 2**: Frontend migration
- Day 1-2: Update authentication flow
- Day 3-4: Update all API calls to JWT
- Day 5: Integration testing

**Week 3**: Testing & deployment
- Day 1-3: Full system testing
- Day 4: Performance testing
- Day 5: Production deployment

---

## Post-Migration Tasks

- [ ] Monitor error logs for 1 week
- [ ] Verify audit logs are being created
- [ ] Check JWT token expiration is working
- [ ] Test user workflows in production
- [ ] Gather user feedback
- [ ] Optimize database queries (add indexes)
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Document any custom changes
- [ ] Train users on new system
- [ ] Archive old collections after 1 month of stability

---

**Status**: Ready for Migration  
**Estimated Time**: 2-3 weeks  
**Risk Level**: Medium (with proper testing)  
**Rollback**: Available (old code preserved)

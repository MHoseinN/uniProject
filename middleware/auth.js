// Middleware برای بررسی احراز هویت
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
};

// Middleware برای بررسی نقش دانشجو
const isStudent = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'student') {
    return next();
  }
  return res.status(403).send('دسترسی محدود: فقط دانشجویان');
};

// Middleware برای بررسی نقش استاد
const isProfessor = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'professor') {
    return next();
  }
  return res.status(403).send('دسترسی محدود: فقط اساتید');
};

// Middleware برای بررسی نقش مدیر گروه
const isManager = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'manager') {
    return next();
  }
  return res.status(403).send('دسترسی محدود: فقط مدیران گروه');
};

module.exports = {
  isAuthenticated,
  isStudent,
  isProfessor,
  isManager
};

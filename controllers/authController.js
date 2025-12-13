const Student = require('../models/Student');
const Professor = require('../models/Professor');
const Manager = require('../models/Manager');

// صفحه ثبت نام
exports.getRegister = (req, res) => {
  res.render('register');
};

// ثبت نام دانشجو
exports.registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, studentNumber, nationalCode, major } = req.body;
    
    // بررسی وجود قبلی
    const existingStudent = await Student.findOne({ 
      $or: [{ studentNumber }, { nationalCode }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        message: 'شماره دانشجویی یا کد ملی قبلا ثبت شده است' 
      });
    }
    
    const student = new Student({
      firstName,
      lastName,
      studentNumber,
      nationalCode,
      major
    });
    
    await student.save();
    
    res.json({ 
      success: true, 
      message: 'ثبت نام با موفقیت انجام شد' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ثبت نام استاد
exports.registerProfessor = async (req, res) => {
  try {
    const { firstName, lastName, professorId, nationalCode, major } = req.body;
    
    // بررسی وجود قبلی
    const existingProfessor = await Professor.findOne({ 
      $or: [{ professorId }, { nationalCode }] 
    });
    
    if (existingProfessor) {
      return res.status(400).json({ 
        success: false, 
        message: 'شماره شناسایی یا کد ملی قبلا ثبت شده است' 
      });
    }
    
    const professor = new Professor({
      firstName,
      lastName,
      professorId,
      nationalCode,
      major
    });
    
    await professor.save();
    
    res.json({ 
      success: true, 
      message: 'ثبت نام با موفقیت انجام شد' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ثبت نام مدیر گروه
exports.registerManager = async (req, res) => {
  try {
    const { firstName, lastName, managerId, nationalCode, major } = req.body;
    
    // بررسی وجود قبلی
    const existingManager = await Manager.findOne({ 
      $or: [{ managerId }, { nationalCode }] 
    });
    
    if (existingManager) {
      return res.status(400).json({ 
        success: false, 
        message: 'شماره شناسایی یا کد ملی قبلا ثبت شده است' 
      });
    }
    
    const manager = new Manager({
      firstName,
      lastName,
      managerId,
      nationalCode,
      major
    });
    
    await manager.save();
    
    res.json({ 
      success: true, 
      message: 'ثبت نام با موفقیت انجام شد' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// صفحه ورود
exports.getLogin = (req, res) => {
  res.render('login');
};

// ورود دانشجو
exports.loginStudent = async (req, res) => {
  try {
    const { nationalCode, studentNumber } = req.body;
    
    const student = await Student.findOne({ nationalCode, studentNumber });
    
    if (!student) {
      return res.status(401).json({ 
        success: false, 
        message: 'اطلاعات ورود نادرست است' 
      });
    }
    
    req.session.user = {
      id: student._id,
      role: 'student',
      firstName: student.firstName,
      lastName: student.lastName,
      major: student.major
    };
    
    res.json({ 
      success: true, 
      redirect: '/student/dashboard' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ورود استاد
exports.loginProfessor = async (req, res) => {
  try {
    const { nationalCode, professorId } = req.body;
    
    const professor = await Professor.findOne({ nationalCode, professorId });
    
    if (!professor) {
      return res.status(401).json({ 
        success: false, 
        message: 'اطلاعات ورود نادرست است' 
      });
    }
    
    req.session.user = {
      id: professor._id,
      role: 'professor',
      firstName: professor.firstName,
      lastName: professor.lastName,
      major: professor.major
    };
    
    res.json({ 
      success: true, 
      redirect: '/professor/dashboard' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ورود مدیر گروه
exports.loginManager = async (req, res) => {
  try {
    const { nationalCode, managerId } = req.body;
    
    const manager = await Manager.findOne({ nationalCode, managerId });
    
    if (!manager) {
      return res.status(401).json({ 
        success: false, 
        message: 'اطلاعات ورود نادرست است' 
      });
    }
    
    req.session.user = {
      id: manager._id,
      role: 'manager',
      firstName: manager.firstName,
      lastName: manager.lastName,
      major: manager.major
    };
    
    res.json({ 
      success: true, 
      redirect: '/manager/dashboard' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// خروج
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('خطا در خروج');
    }
    res.redirect('/');
  });
};

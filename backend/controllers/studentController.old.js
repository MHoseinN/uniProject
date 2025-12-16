const Project = require('../models/Project');
const Student = require('../models/Student');
const Professor = require('../models/Professor');
const Manager = require('../models/Manager');
const Message = require('../models/Message');

// داشبورد دانشجو
exports.getDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.session.user.id).populate('project');
    const project = await Project.findOne({ student: student._id })
      .populate('supervisor')
      .populate('examiner')
      .populate('manager');
    
    // بررسی اینکه درخواست از Vue.js است یا EJS
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.json({ 
        success: true,
        student,
        project 
      });
    } else {
      res.render('student/dashboard', { 
        user: req.session.user,
        student,
        project 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// درخواست پروژه
exports.requestProject = async (req, res) => {
  try {
    const student = await Student.findById(req.session.user.id);
    
    // بررسی اینکه آیا قبلا درخواست داده
    const existingProject = await Project.findOne({ student: student._id });
    if (existingProject) {
      return res.status(400).json({ 
        success: false, 
        message: 'شما قبلا درخواست پروژه داده‌اید' 
      });
    }
    
    // پیدا کردن مدیر گروه با رشته مشابه
    const manager = await Manager.findOne({ major: student.major });
    if (!manager) {
      return res.status(404).json({ 
        success: false, 
        message: 'مدیر گروه برای رشته شما یافت نشد' 
      });
    }
    
    // ایجاد پروژه با وضعیت pending
    const project = new Project({
      student: student._id,
      manager: manager._id,
      status: 'pending'
    });
    
    await project.save();
    
    student.project = project._id;
    await student.save();
    
    res.json({ 
      success: true, 
      message: 'درخواست پروژه با موفقیت ثبت شد' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// پیشنهاد موضوع
exports.proposeTopic = async (req, res) => {
  try {
    const { topic } = req.body;
    
    const project = await Project.findOne({ student: req.session.user.id });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'پروژه‌ای یافت نشد' 
      });
    }
    
    if (project.status !== 'topic_proposal') {
      return res.status(400).json({ 
        success: false, 
        message: 'امکان پیشنهاد موضوع در این مرحله وجود ندارد' 
      });
    }
    
    project.proposedTopics.push({ topic });
    await project.save();
    
    res.json({ 
      success: true, 
      message: 'موضوع پیشنهادی ثبت شد' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ارسال گزارش
exports.submitReport = async (req, res) => {
  try {
    const { report } = req.body;
    
    const project = await Project.findOne({ student: req.session.user.id });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'پروژه‌ای یافت نشد' 
      });
    }
    
    if (project.status !== 'in_progress') {
      return res.status(400).json({ 
        success: false, 
        message: 'امکان ارسال گزارش در این مرحله وجود ندارد' 
      });
    }
    
    project.reports.push({ content: report });
    await project.save();
    
    res.json({ 
      success: true, 
      message: 'گزارش با موفقیت ثبت شد' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ارسال پیام
exports.sendMessage = async (req, res) => {
  try {
    const { to, toModel, content } = req.body;
    
    const message = new Message({
      from: req.session.user.id,
      fromModel: 'Student',
      to,
      toModel,
      content
    });
    
    await message.save();
    
    res.json({ 
      success: true, 
      message: 'پیام ارسال شد' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// دریافت پیام‌ها
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ 
      to: req.session.user.id 
    })
    .populate('from')
    .sort('-createdAt');
    
    res.json({ 
      success: true, 
      messages 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

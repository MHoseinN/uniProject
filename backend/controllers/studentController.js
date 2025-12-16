const Project = require('../models/Project');
const Term = require('../models/Term');
const User = require('../models/User');
const { logAction } = require('../utils/logger');

/**
 * دریافت داشبورد دانشجو
 * GET /student/dashboard
 */
async function getDashboard(req, res) {
  try {
    const studentId = req.userId;
    
    // دریافت اطلاعات دانشجو
    const student = await User.findById(studentId).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'دانشجو یافت نشد'
      });
    }
    
    // دریافت ترم فعال
    const activeTerm = await Term.findOne({ isActive: true });
    
    if (!activeTerm) {
      return res.json({
        success: true,
        student,
        project: null,
        message: 'هیچ ترم فعالی وجود ندارد'
      });
    }
    
    // دریافت پروژه دانشجو در ترم فعال
    const project = await Project.findOne({
      student: studentId,
      term: activeTerm._id,
      status: { $nin: ['rejected'] }
    })
    .populate('supervisor', 'firstName lastName professorId')
    .populate('examiner', 'firstName lastName professorId')
    .populate('term', 'name');
    
    return res.json({
      success: true,
      student,
      project,
      term: activeTerm
    });
  } catch (error) {
    console.error('خطا در دریافت داشبورد:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * درخواست اخذ پروژه
 * POST /student/request-project
 */
async function requestProject(req, res) {
  try {
    const studentId = req.userId;
    const student = await User.findById(studentId);
    
    // بررسی ترم فعال
    const activeTerm = await Term.findOne({ isActive: true });
    
    if (!activeTerm) {
      return res.status(400).json({
        success: false,
        message: 'هیچ ترم فعالی برای اخذ پروژه وجود ندارد'
      });
    }
    
    // بررسی اینکه دانشجو قبلاً پروژه فعال نداشته باشد
    const existingProject = await Project.findOne({
      student: studentId,
      term: activeTerm._id,
      status: { $nin: ['completed', 'rejected'] }
    });
    
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'شما قبلاً برای این ترم درخواست پروژه داده‌اید'
      });
    }
    
    // بررسی ظرفیت رشته
    const capacity = activeTerm.capacities.find(c => c.major === student.major);
    
    if (!capacity) {
      return res.status(400).json({
        success: false,
        message: 'ظرفیت پروژه برای رشته شما تعریف نشده است'
      });
    }
    
    if (capacity.currentCount >= capacity.maxProjects) {
      return res.status(400).json({
        success: false,
        message: 'ظرفیت پروژه برای رشته شما تکمیل شده است'
      });
    }
    
    // ایجاد پروژه جدید
    const project = await Project.create({
      student: studentId,
      term: activeTerm._id,
      major: student.major,
      status: 'pending',
      requestedAt: new Date()
    });
    
    // ثبت لاگ
    await logAction('PROJECT_REQUESTED', studentId, {
      targetProject: project._id,
      details: { term: activeTerm.name, major: student.major },
      ipAddress: req.ip
    });
    
    return res.status(201).json({
      success: true,
      message: 'درخواست پروژه با موفقیت ثبت شد. منتظر تأیید مدیر گروه باشید.',
      project
    });
  } catch (error) {
    console.error('خطا در درخواست پروژه:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * پیشنهاد موضوع پروژه
 * POST /student/propose-topic
 */
async function proposeTopic(req, res) {
  try {
    const { topic } = req.body;
    const studentId = req.userId;
    
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'موضوع نمی‌تواند خالی باشد'
      });
    }
    
    // پیدا کردن پروژه فعال دانشجو
    const activeTerm = await Term.findOne({ isActive: true });
    const project = await Project.findOne({
      student: studentId,
      term: activeTerm._id,
      status: { $in: ['topic_proposal', 'supervisor_assigned'] }
    });
    
    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'شما پروژه فعالی برای پیشنهاد موضوع ندارید'
      });
    }
    
    // اضافه کردن موضوع پیشنهادی
    project.proposedTopics.push({
      topic: topic.trim(),
      proposedAt: new Date()
    });
    
    await project.save();
    
    // ثبت لاگ
    await logAction('TOPIC_PROPOSED', studentId, {
      targetProject: project._id,
      details: { topic: topic.trim() },
      ipAddress: req.ip
    });
    
    return res.json({
      success: true,
      message: 'موضوع با موفقیت ثبت شد',
      project
    });
  } catch (error) {
    console.error('خطا در پیشنهاد موضوع:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * ارسال گزارش پیشرفت
 * POST /student/submit-report
 */
async function submitReport(req, res) {
  try {
    const { content } = req.body;
    const studentId = req.userId;
    const file = req.file; // از multer
    
    if (!content && !file) {
      return res.status(400).json({
        success: false,
        message: 'لطفاً متن گزارش یا فایل را ارسال کنید'
      });
    }
    
    // پیدا کردن پروژه فعال دانشجو
    const activeTerm = await Term.findOne({ isActive: true });
    const project = await Project.findOne({
      student: studentId,
      term: activeTerm._id,
      status: 'in_progress'
    });
    
    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'شما پروژه فعالی برای ارسال گزارش ندارید'
      });
    }
    
    // اضافه کردن گزارش
    const report = {
      content: content || null,
      submittedAt: new Date()
    };
    
    if (file) {
      report.fileUrl = `/uploads/reports/${file.filename}`;
      report.fileName = file.originalname;
      report.fileSize = file.size;
    }
    
    project.reports.push(report);
    await project.save();
    
    // ثبت لاگ
    await logAction('REPORT_SUBMITTED', studentId, {
      targetProject: project._id,
      details: { hasFile: !!file, hasContent: !!content },
      ipAddress: req.ip
    });
    
    return res.json({
      success: true,
      message: 'گزارش با موفقیت ثبت شد',
      report
    });
  } catch (error) {
    console.error('خطا در ارسال گزارش:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * مشاهده نمره و وضعیت نهایی
 * GET /student/final-status
 */
async function getFinalStatus(req, res) {
  try {
    const studentId = req.userId;
    const activeTerm = await Term.findOne({ isActive: true });
    
    const project = await Project.findOne({
      student: studentId,
      term: activeTerm._id
    })
    .populate('supervisor', 'firstName lastName')
    .populate('examiner', 'firstName lastName')
    .populate('gradedBy', 'firstName lastName');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'پروژه‌ای یافت نشد'
      });
    }
    
    return res.json({
      success: true,
      project: {
        projectCode: project.projectCode,
        topic: project.topic,
        status: project.status,
        supervisor: project.supervisor,
        examiner: project.examiner,
        defenseDate: project.defenseDate,
        defenseStartTime: project.defenseStartTime,
        defenseLocation: project.defenseLocation,
        grade: project.grade,
        gradedAt: project.gradedAt,
        gradedBy: project.gradedBy
      }
    });
  } catch (error) {
    console.error('خطا در دریافت وضعیت نهایی:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

module.exports = {
  getDashboard,
  requestProject,
  proposeTopic,
  submitReport,
  getFinalStatus
};

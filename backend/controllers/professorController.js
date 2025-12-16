const Project = require('../models/Project');
const User = require('../models/User');
const Term = require('../models/Term');
const { logAction } = require('../utils/logger');

/**
 * دریافت لیست پروژه‌های استاد (راهنما و داور)
 * GET /professor/projects
 */
async function getProjects(req, res) {
  try {
    const professorId = req.userId;
    const { role } = req.query; // 'supervisor' یا 'examiner'
    
    const query = { term: await Term.findOne({ isActive: true }).select('_id') };
    
    if (role === 'supervisor') {
      query.supervisor = professorId;
    } else if (role === 'examiner') {
      query.examiner = professorId;
    } else {
      query.$or = [{ supervisor: professorId }, { examiner: professorId }];
    }
    
    const projects = await Project.find(query)
      .populate('student', 'firstName lastName studentNumber major')
      .populate('supervisor', 'firstName lastName')
      .populate('examiner', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error('خطا در دریافت پروژه‌ها:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * مشاهده موضوعات پیشنهادی یک پروژه
 * GET /professor/projects/:projectId/proposed-topics
 */
async function getProposedTopics(req, res) {
  try {
    const { projectId } = req.params;
    const professorId = req.userId;
    
    const project = await Project.findById(projectId)
      .populate('student', 'firstName lastName studentNumber');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'پروژه یافت نشد'
      });
    }
    
    // فقط استاد راهنما می‌تواند موضوعات را ببیند
    if (project.supervisor?.toString() !== professorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'شما مجوز دسترسی به این پروژه را ندارید'
      });
    }
    
    return res.json({
      success: true,
      project: {
        id: project._id,
        projectCode: project.projectCode,
        student: project.student,
        proposedTopics: project.proposedTopics
      }
    });
  } catch (error) {
    console.error('خطا در دریافت موضوعات:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * تأیید موضوع پروژه
 * POST /professor/projects/:projectId/approve-topic
 */
async function approveTopic(req, res) {
  try {
    const { projectId } = req.params;
    const { topicIndex } = req.body;
    const professorId = req.userId;
    
    const project = await Project.findById(projectId)
      .populate('student', 'firstName lastName');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'پروژه یافت نشد'
      });
    }
    
    // فقط استاد راهنما می‌تواند موضوع را تأیید کند
    if (project.supervisor?.toString() !== professorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'فقط استاد راهنما می‌تواند موضوع را تأیید کند'
      });
    }
    
    if (project.status !== 'topic_proposal' && project.status !== 'supervisor_assigned') {
      return res.status(400).json({
        success: false,
        message: 'این پروژه در مرحله تأیید موضوع نیست'
      });
    }
    
    if (!project.proposedTopics[topicIndex]) {
      return res.status(400).json({
        success: false,
        message: 'موضوع انتخاب شده معتبر نیست'
      });
    }
    
    // تأیید موضوع
    project.topic = project.proposedTopics[topicIndex].topic;
    project.status = 'topic_approved';
    project.topicApprovedAt = new Date();
    
    await project.save();
    
    // ثبت لاگ
    await logAction('TOPIC_APPROVED', professorId, {
      targetProject: project._id,
      targetUser: project.student,
      details: { topic: project.topic },
      ipAddress: req.ip
    });
    
    return res.json({
      success: true,
      message: 'موضوع با موفقیت تأیید شد',
      project
    });
  } catch (error) {
    console.error('خطا در تأیید موضوع:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * ارسال زمان‌های پیشنهادی دفاع
 * POST /professor/projects/:projectId/defense-times
 */
async function submitDefenseTimes(req, res) {
  try {
    const { projectId } = req.params;
    const { times } = req.body; // آرایه‌ای از {date, startTime, endTime}
    const professorId = req.userId;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'پروژه یافت نشد'
      });
    }
    
    // فقط استاد داور می‌تواند زمان دفاع تعیین کند
    if (project.examiner?.toString() !== professorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'فقط استاد داور می‌تواند زمان دفاع تعیین کند'
      });
    }
    
    if (project.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'این پروژه در مرحله تعیین زمان دفاع نیست'
      });
    }
    
    // اضافه کردن زمان‌های پیشنهادی
    project.proposedDefenseTimes = times.map(t => ({
      date: t.date,
      startTime: t.startTime,
      endTime: t.endTime,
      submittedBy: professorId
    }));
    
    await project.save();
    
    // ثبت لاگ
    await logAction('DEFENSE_TIMES_SUBMITTED', professorId, {
      targetProject: project._id,
      details: { timesCount: times.length },
      ipAddress: req.ip
    });
    
    return res.json({
      success: true,
      message: 'زمان‌های پیشنهادی با موفقیت ثبت شد',
      proposedDefenseTimes: project.proposedDefenseTimes
    });
  } catch (error) {
    console.error('خطا در ثبت زمان دفاع:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * ثبت نمره پروژه
 * POST /professor/projects/:projectId/grade
 */
async function gradeProject(req, res) {
  try {
    const { projectId } = req.params;
    const { grade } = req.body;
    const professorId = req.userId;
    
    if (grade < 0 || grade > 20) {
      return res.status(400).json({
        success: false,
        message: 'نمره باید بین ۰ تا ۲۰ باشد'
      });
    }
    
    const project = await Project.findById(projectId)
      .populate('student', 'firstName lastName');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'پروژه یافت نشد'
      });
    }
    
    // فقط استاد داور می‌تواند نمره ثبت کند
    if (project.examiner?.toString() !== professorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'فقط استاد داور می‌تواند نمره ثبت کند'
      });
    }
    
    if (project.status !== 'defense_scheduled') {
      return res.status(400).json({
        success: false,
        message: 'هنوز زمان دفاع تعیین نشده است'
      });
    }
    
    // ثبت نمره
    project.grade = grade;
    project.status = 'completed';
    project.gradedAt = new Date();
    project.gradedBy = professorId;
    project.completedAt = new Date();
    
    await project.save();
    
    // ثبت لاگ
    await logAction('GRADE_SUBMITTED', professorId, {
      targetProject: project._id,
      targetUser: project.student,
      details: { grade },
      ipAddress: req.ip
    });
    
    return res.json({
      success: true,
      message: 'نمره با موفقیت ثبت شد',
      project: {
        id: project._id,
        student: project.student,
        grade: project.grade,
        status: project.status
      }
    });
  } catch (error) {
    console.error('خطا در ثبت نمره:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * مشاهده گزارش‌های یک پروژه
 * GET /professor/projects/:projectId/reports
 */
async function getProjectReports(req, res) {
  try {
    const { projectId } = req.params;
    const professorId = req.userId;
    
    const project = await Project.findById(projectId)
      .populate('student', 'firstName lastName studentNumber')
      .select('projectCode student reports');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'پروژه یافت نشد'
      });
    }
    
    // فقط استاد راهنما یا داور می‌تواند گزارش‌ها را ببیند
    if (project.supervisor?.toString() !== professorId.toString() && 
        project.examiner?.toString() !== professorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'شما مجوز دسترسی به این پروژه را ندارید'
      });
    }
    
    return res.json({
      success: true,
      project: {
        id: project._id,
        projectCode: project.projectCode,
        student: project.student,
        reports: project.reports
      }
    });
  } catch (error) {
    console.error('خطا در دریافت گزارش‌ها:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

module.exports = {
  getProjects,
  getProposedTopics,
  approveTopic,
  submitDefenseTimes,
  gradeProject,
  getProjectReports
};

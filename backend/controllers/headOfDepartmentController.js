const Project = require('../models/Project');
const User = require('../models/User');
const Term = require('../models/Term');
const { logAction } = require('../utils/logger');

/**
 * تعریف ترم جدید
 * POST /head/terms
 */
async function createTerm(req, res) {
  try {
    const { name, startDate, endDate, capacities } = req.body;
    const headId = req.userId;
    
    // غیرفعال کردن ترم قبلی
    await Term.updateMany({ isActive: true }, { isActive: false });
    
    // ایجاد ترم جدید
    const term = await Term.create({
      name,
      startDate,
      endDate,
      isActive: true,
      capacities: capacities.map(c => ({
        major: c.major,
        maxProjects: c.maxProjects,
        currentCount: 0
      })),
      createdBy: headId
    });
    
    // ثبت لاگ
    await logAction('TERM_CREATED', headId, {
      details: { termName: name },
      ipAddress: req.ip
    });
    
    return res.status(201).json({
      success: true,
      message: 'ترم جدید با موفقیت ایجاد شد',
      term
    });
  } catch (error) {
    console.error('خطا در ایجاد ترم:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * تنظیم ظرفیت پروژه برای هر رشته
 * PUT /head/terms/:termId/capacity
 */
async function setCapacity(req, res) {
  try {
    const { termId } = req.params;
    const { capacities } = req.body;
    const headId = req.userId;
    
    const term = await Term.findById(termId);
    
    if (!term) {
      return res.status(404).json({
        success: false,
        message: 'ترم یافت نشد'
      });
    }
    
    // به‌روزرسانی ظرفیت‌ها (currentCount حفظ می‌شود)
    capacities.forEach(newCap => {
      const existingCap = term.capacities.find(c => c.major === newCap.major);
      if (existingCap) {
        existingCap.maxProjects = newCap.maxProjects;
      } else {
        term.capacities.push({
          major: newCap.major,
          maxProjects: newCap.maxProjects,
          currentCount: 0
        });
      }
    });
    
    await term.save();
    
    // ثبت لاگ
    await logAction('CAPACITY_UPDATED', headId, {
      details: { termId, capacities },
      ipAddress: req.ip
    });
    
    return res.json({
      success: true,
      message: 'ظرفیت‌ها با موفقیت به‌روزرسانی شد',
      term
    });
  } catch (error) {
    console.error('خطا در تنظیم ظرفیت:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * تنظیم محدودیت تعداد دانشجوی هر استاد داور
 * POST /head/examiner-limits
 */
async function setExaminerLimits(req, res) {
  try {
    const { professorId, maxExaminees } = req.body;
    const headId = req.userId;
    
    const professor = await User.findById(professorId);
    
    if (!professor || professor.role !== 'professor') {
      return res.status(404).json({
        success: false,
        message: 'استاد یافت نشد'
      });
    }
    
    professor.maxExaminees = maxExaminees;
    await professor.save();
    
    // ثبت لاگ
    await logAction('EXAMINER_LIMIT_SET', headId, {
      targetUser: professorId,
      details: { maxExaminees },
      ipAddress: req.ip
    });
    
    return res.json({
      success: true,
      message: 'محدودیت تعداد دانشجوی داوری تنظیم شد',
      professor: {
        id: professor._id,
        name: `${professor.firstName} ${professor.lastName}`,
        maxExaminees: professor.maxExaminees
      }
    });
  } catch (error) {
    console.error('خطا در تنظیم محدودیت:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * دریافت درخواست‌های پروژه در انتظار تأیید
 * GET /head/pending-projects
 */
async function getPendingProjects(req, res) {
  try {
    const activeTerm = await Term.findOne({ isActive: true });
    
    if (!activeTerm) {
      return res.json({
        success: true,
        projects: [],
        message: 'هیچ ترم فعالی وجود ندارد'
      });
    }
    
    const projects = await Project.find({
      term: activeTerm._id,
      status: 'pending'
    })
    .populate('student', 'firstName lastName studentNumber major')
    .sort({ requestedAt: 1 });
    
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
 * تأیید درخواست پروژه
 * POST /head/projects/:projectId/approve
 */
async function approveProject(req, res) {
  try {
    const { projectId } = req.params;
    const headId = req.userId;
    
    const project = await Project.findById(projectId)
      .populate('student', 'firstName lastName major')
      .populate('term');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'پروژه یافت نشد'
      });
    }
    
    if (project.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'این پروژه قبلاً بررسی شده است'
      });
    }
    
    // بررسی ظرفیت رشته
    const term = project.term;
    const capacity = term.capacities.find(c => c.major === project.major);
    
    if (!capacity) {
      return res.status(400).json({
        success: false,
        message: 'ظرفیت برای این رشته تعریف نشده است'
      });
    }
    
    if (capacity.currentCount >= capacity.maxProjects) {
      return res.status(400).json({
        success: false,
        message: 'ظرفیت پروژه برای این رشته تکمیل شده است'
      });
    }
    
    // تأیید پروژه و افزایش شمارنده
    project.status = 'approved';
    project.approvedAt = new Date();
    project.approvedBy = headId;
    
    // افزایش currentCount
    capacity.currentCount += 1;
    
    await project.save();
    await term.save();
    
    // ثبت لاگ
    await logAction('PROJECT_APPROVED', headId, {
      targetProject: project._id,
      targetUser: project.student._id,
      details: { major: project.major },
      ipAddress: req.ip
    });
    
    return res.json({
      success: true,
      message: 'درخواست پروژه تأیید شد',
      project
    });
  } catch (error) {
    console.error('خطا در تأیید پروژه:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * تخصیص استاد راهنما به پروژه‌های تأیید شده
 * POST /head/assign-supervisors
 * الگوریتم توزیع عادلانه
 */
async function assignSupervisors(req, res) {
  try {
    const headId = req.userId;
    const activeTerm = await Term.findOne({ isActive: true });
    
    if (!activeTerm) {
      return res.status(400).json({
        success: false,
        message: 'هیچ ترم فعالی وجود ندارد'
      });
    }
    
    // دریافت پروژه‌های تأیید شده بدون استاد راهنما
    const projects = await Project.find({
      term: activeTerm._id,
      status: 'approved',
      supervisor: null
    }).populate('student', 'major');
    
    if (projects.length === 0) {
      return res.json({
        success: true,
        message: 'هیچ پروژه‌ای برای تخصیص وجود ندارد',
        assigned: []
      });
    }
    
    // دریافت اساتید فعال
    const professors = await User.find({
      role: 'professor',
      isActive: true,
      isApproved: true
    }).select('_id firstName lastName currentSupervisees');
    
    if (professors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'هیچ استاد فعالی یافت نشد'
      });
    }
    
    // الگوریتم توزیع عادلانه (Round Robin بر اساس تعداد دانشجوی فعلی)
    const sortedProfessors = professors.sort((a, b) => 
      a.currentSupervisees - b.currentSupervisees
    );
    
    const assignments = [];
    let professorIndex = 0;
    
    for (const project of projects) {
      const supervisor = sortedProfessors[professorIndex];
      
      project.supervisor = supervisor._id;
      project.status = 'supervisor_assigned';
      project.supervisorAssignedAt = new Date();
      
      await project.save();
      
      // افزایش شمارنده دانشجوی استاد
      supervisor.currentSupervisees += 1;
      await supervisor.save();
      
      assignments.push({
        projectId: project._id,
        student: project.student,
        supervisor: {
          id: supervisor._id,
          name: `${supervisor.firstName} ${supervisor.lastName}`
        }
      });
      
      // ثبت لاگ
      await logAction('SUPERVISOR_ASSIGNED', headId, {
        targetProject: project._id,
        targetUser: supervisor._id,
        details: { studentId: project.student._id },
        ipAddress: req.ip
      });
      
      // چرخش به استاد بعدی
      professorIndex = (professorIndex + 1) % sortedProfessors.length;
      
      // مرتب‌سازی مجدد برای حفظ توزیع عادلانه
      sortedProfessors.sort((a, b) => a.currentSupervisees - b.currentSupervisees);
    }
    
    return res.json({
      success: true,
      message: `${assignments.length} پروژه با موفقیت به اساتید تخصیص یافت`,
      assignments
    });
  } catch (error) {
    console.error('خطا در تخصیص اساتید راهنما:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * تخصیص استاد داور به پروژه‌های با موضوع تأیید شده
 * POST /head/assign-examiners
 * الگوریتم اطمینان از راهنما ≠ داور
 */
async function assignExaminers(req, res) {
  try {
    const headId = req.userId;
    const activeTerm = await Term.findOne({ isActive: true });
    
    if (!activeTerm) {
      return res.status(400).json({
        success: false,
        message: 'هیچ ترم فعالی وجود ندارد'
      });
    }
    
    // دریافت پروژه‌های با موضوع تأیید شده بدون استاد داور
    const projects = await Project.find({
      term: activeTerm._id,
      status: 'topic_approved',
      examiner: null
    }).populate('student', 'major').populate('supervisor', 'firstName lastName');
    
    if (projects.length === 0) {
      return res.json({
        success: true,
        message: 'هیچ پروژه‌ای برای تخصیص داور وجود ندارد',
        assigned: []
      });
    }
    
    // دریافت اساتید فعال
    const professors = await User.find({
      role: 'professor',
      isActive: true,
      isApproved: true
    }).select('_id firstName lastName currentExaminees maxExaminees');
    
    if (professors.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'حداقل دو استاد فعال برای تخصیص داور مورد نیاز است'
      });
    }
    
    const assignments = [];
    
    for (const project of projects) {
      // فیلتر اساتید: حذف استاد راهنما + بررسی ظرفیت
      const eligibleProfessors = professors.filter(prof => 
        prof._id.toString() !== project.supervisor._id.toString() &&
        (!prof.maxExaminees || prof.currentExaminees < prof.maxExaminees)
      );
      
      if (eligibleProfessors.length === 0) {
        console.warn(`هیچ استاد واجد شرایطی برای پروژه ${project._id} یافت نشد`);
        continue;
      }
      
      // انتخاب استاد با کمترین تعداد دانشجو
      const sortedEligible = eligibleProfessors.sort((a, b) => 
        a.currentExaminees - b.currentExaminees
      );
      
      const examiner = sortedEligible[0];
      
      project.examiner = examiner._id;
      project.status = 'in_progress';
      project.examinerAssignedAt = new Date();
      
      await project.save();
      
      // افزایش شمارنده دانشجوی داوری
      examiner.currentExaminees += 1;
      await examiner.save();
      
      assignments.push({
        projectId: project._id,
        student: project.student,
        supervisor: project.supervisor,
        examiner: {
          id: examiner._id,
          name: `${examiner.firstName} ${examiner.lastName}`
        }
      });
      
      // ثبت لاگ
      await logAction('EXAMINER_ASSIGNED', headId, {
        targetProject: project._id,
        targetUser: examiner._id,
        details: { studentId: project.student._id },
        ipAddress: req.ip
      });
    }
    
    return res.json({
      success: true,
      message: `${assignments.length} پروژه با موفقیت به اساتید داور تخصیص یافت`,
      assignments
    });
  } catch (error) {
    console.error('خطا در تخصیص اساتید داور:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * زمان‌بندی دفاع‌ها (بدون تداخل)
 * POST /head/schedule-defenses
 */
async function scheduleDefenses(req, res) {
  try {
    const headId = req.userId;
    const activeTerm = await Term.findOne({ isActive: true });
    
    if (!activeTerm) {
      return res.status(400).json({
        success: false,
        message: 'هیچ ترم فعالی وجود ندارد'
      });
    }
    
    // دریافت پروژه‌هایی که زمان دفاع پیشنهادی دارند ولی زمان قطعی ندارند
    const projects = await Project.find({
      term: activeTerm._id,
      status: 'in_progress',
      proposedDefenseTimes: { $exists: true, $ne: [] },
      defenseDate: null
    })
    .populate('supervisor', 'firstName lastName')
    .populate('examiner', 'firstName lastName');
    
    if (projects.length === 0) {
      return res.json({
        success: true,
        message: 'هیچ پروژه‌ای برای زمان‌بندی وجود ندارد',
        scheduled: []
      });
    }
    
    // ایجاد نقشه تداخل زمانی برای هر استاد
    const professorSchedules = {};
    
    const scheduled = [];
    
    for (const project of projects) {
      let selectedTime = null;
      
      // پیدا کردن اولین زمان بدون تداخل
      for (const proposedTime of project.proposedDefenseTimes) {
        const supervisorId = project.supervisor._id.toString();
        const examinerId = project.examiner._id.toString();
        
        const timeKey = `${proposedTime.date}_${proposedTime.startTime}`;
        
        // بررسی تداخل با استاد راهنما
        if (professorSchedules[supervisorId]?.includes(timeKey)) {
          continue;
        }
        
        // بررسی تداخل با استاد داور
        if (professorSchedules[examinerId]?.includes(timeKey)) {
          continue;
        }
        
        // زمان مناسب پیدا شد
        selectedTime = proposedTime;
        
        // رزرو زمان برای هر دو استاد
        if (!professorSchedules[supervisorId]) {
          professorSchedules[supervisorId] = [];
        }
        professorSchedules[supervisorId].push(timeKey);
        
        if (!professorSchedules[examinerId]) {
          professorSchedules[examinerId] = [];
        }
        professorSchedules[examinerId].push(timeKey);
        
        break;
      }
      
      if (selectedTime) {
        project.defenseDate = selectedTime.date;
        project.defenseStartTime = selectedTime.startTime;
        project.defenseEndTime = selectedTime.endTime;
        project.status = 'defense_scheduled';
        project.defenseScheduledAt = new Date();
        
        await project.save();
        
        scheduled.push({
          projectId: project._id,
          projectCode: project.projectCode,
          date: selectedTime.date,
          startTime: selectedTime.startTime,
          endTime: selectedTime.endTime,
          supervisor: project.supervisor,
          examiner: project.examiner
        });
        
        // ثبت لاگ
        await logAction('DEFENSE_SCHEDULED', headId, {
          targetProject: project._id,
          details: { 
            date: selectedTime.date, 
            time: `${selectedTime.startTime} - ${selectedTime.endTime}` 
          },
          ipAddress: req.ip
        });
      }
    }
    
    return res.json({
      success: true,
      message: `${scheduled.length} دفاع با موفقیت زمان‌بندی شد`,
      scheduled
    });
  } catch (error) {
    console.error('خطا در زمان‌بندی دفاع‌ها:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * مشاهده آمار کلی
 * GET /head/statistics
 */
async function getStatistics(req, res) {
  try {
    const activeTerm = await Term.findOne({ isActive: true });
    
    if (!activeTerm) {
      return res.json({
        success: true,
        statistics: null,
        message: 'هیچ ترم فعالی وجود ندارد'
      });
    }
    
    const totalProjects = await Project.countDocuments({ term: activeTerm._id });
    const pendingProjects = await Project.countDocuments({ term: activeTerm._id, status: 'pending' });
    const approvedProjects = await Project.countDocuments({ term: activeTerm._id, status: 'approved' });
    const inProgressProjects = await Project.countDocuments({ term: activeTerm._id, status: 'in_progress' });
    const completedProjects = await Project.countDocuments({ term: activeTerm._id, status: 'completed' });
    
    const totalProfessors = await User.countDocuments({ role: 'professor', isActive: true });
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    
    return res.json({
      success: true,
      statistics: {
        term: activeTerm.name,
        projects: {
          total: totalProjects,
          pending: pendingProjects,
          approved: approvedProjects,
          inProgress: inProgressProjects,
          completed: completedProjects
        },
        users: {
          professors: totalProfessors,
          students: totalStudents
        },
        capacities: activeTerm.capacities
      }
    });
  } catch (error) {
    console.error('خطا در دریافت آمار:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

module.exports = {
  createTerm,
  setCapacity,
  setExaminerLimits,
  getPendingProjects,
  approveProject,
  assignSupervisors,
  assignExaminers,
  scheduleDefenses,
  getStatistics
};

const Project = require('../models/Project');
const Professor = require('../models/Professor');
const Manager = require('../models/Manager');
const DefenseTimeSlot = require('../models/DefenseTimeSlot');
const Message = require('../models/Message');

// داشبورد مدیر گروه
exports.getDashboard = async (req, res) => {
  try {
    const manager = await Manager.findById(req.session.user.id);
    
    // پروژه‌های در انتظار تایید
    const pendingProjects = await Project.find({ 
      manager: manager._id,
      status: 'pending'
    }).populate('student');
    
    // تمام پروژه‌های رشته
    const allProjects = await Project.find({ 
      manager: manager._id 
    })
    .populate('student')
    .populate('supervisor')
    .populate('examiner');
    
    // زمان‌های پیشنهادی برای دفاعیه
    const proposedTimeSlots = await DefenseTimeSlot.find({ 
      status: 'proposed' 
    }).populate('professor');
    
    res.render('manager/dashboard', {
      user: req.session.user,
      manager,
      pendingProjects,
      allProjects,
      proposedTimeSlots
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// تایید درخواست پروژه و انتخاب استاد راهنما و داور
exports.approveProject = async (req, res) => {
  try {
    const { projectId, supervisorId, examinerId } = req.body;
    
    if (supervisorId === examinerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'استاد راهنما و استاد داور نمی‌توانند یک نفر باشند' 
      });
    }
    
    const project = await Project.findById(projectId);
    
    if (!project || project.manager.toString() !== req.session.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      });
    }
    
    project.supervisor = supervisorId;
    project.examiner = examinerId;
    project.status = 'topic_proposal';
    await project.save();
    
    res.json({ 
      success: true, 
      message: 'پروژه تایید شد و اساتید انتخاب شدند' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// دریافت لیست اساتید رشته
exports.getProfessors = async (req, res) => {
  try {
    const manager = await Manager.findById(req.session.user.id);
    
    const professors = await Professor.find({ major: manager.major });
    
    res.json({ 
      success: true, 
      professors 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// تایید زمان‌های دفاعیه
exports.approveDefenseTimes = async (req, res) => {
  try {
    const { timeSlotIds } = req.body;
    
    // تایید زمان‌های انتخاب شده
    await DefenseTimeSlot.updateMany(
      { _id: { $in: timeSlotIds } },
      { 
        status: 'approved',
        manager: req.session.user.id 
      }
    );
    
    // تخصیص خودکار زمان دفاعیه به دانشجویان
    await allocateDefenseTimes(req.session.user.id);
    
    res.json({ 
      success: true, 
      message: 'زمان‌های دفاعیه تایید و به دانشجویان اختصاص داده شد' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// تابع تخصیص خودکار زمان دفاعیه
async function allocateDefenseTimes(managerId) {
  // پروژه‌های آماده برای دفاعیه
  const projects = await Project.find({
    manager: managerId,
    status: 'in_progress',
    defenseDate: null
  }).populate('examiner');
  
  // زمان‌های تایید شده
  const approvedSlots = await DefenseTimeSlot.find({ 
    status: 'approved',
    manager: managerId 
  }).sort('date startTime');
  
  let slotIndex = 0;
  let currentTime = null;
  
  for (const project of projects) {
    if (slotIndex >= approvedSlots.length) break;
    
    const slot = approvedSlots[slotIndex];
    
    // محاسبه زمان دفاعیه (20 دقیقه)
    if (!currentTime || currentTime >= slot.endTime) {
      currentTime = slot.startTime;
    }
    
    // تبدیل زمان به دقیقه
    const [hours, minutes] = currentTime.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    
    const defenseStartTime = currentTime;
    totalMinutes += 20;
    const defenseEndTime = `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, '0')}`;
    
    // اختصاص زمان به پروژه
    project.defenseDate = slot.date;
    project.defenseTime = `${defenseStartTime} - ${defenseEndTime}`;
    project.status = 'defense_scheduled';
    await project.save();
    
    currentTime = defenseEndTime;
    
    // اگر از زمان پایان slot گذشت، به slot بعدی برو
    if (currentTime >= slot.endTime) {
      slotIndex++;
      currentTime = null;
    }
  }
}

// ارسال پیام
exports.sendMessage = async (req, res) => {
  try {
    const { to, toModel, content } = req.body;
    
    const message = new Message({
      from: req.session.user.id,
      fromModel: 'Manager',
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

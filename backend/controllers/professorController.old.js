const Project = require('../models/Project');
const Professor = require('../models/Professor');
const DefenseTimeSlot = require('../models/DefenseTimeSlot');
const Message = require('../models/Message');

// داشبورد استاد
exports.getDashboard = async (req, res) => {
  try {
    const professor = await Professor.findById(req.session.user.id);
    
    // پروژه‌هایی که استاد راهنماست
    const supervisedProjects = await Project.find({ supervisor: professor._id })
      .populate('student')
      .populate('examiner');
    
    // پروژه‌هایی که استاد داور است
    const examinedProjects = await Project.find({ examiner: professor._id })
      .populate('student')
      .populate('supervisor');
    
    res.render('professor/dashboard', {
      user: req.session.user,
      professor,
      supervisedProjects,
      examinedProjects
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// مشاهده موضوعات پیشنهادی دانشجو
exports.getProposedTopics = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate('student');
    
    if (!project || project.supervisor.toString() !== req.session.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      });
    }
    
    res.json({ 
      success: true, 
      proposedTopics: project.proposedTopics,
      student: project.student 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// تایید موضوع
exports.approveTopic = async (req, res) => {
  try {
    const { projectId, topicIndex } = req.body;
    
    const project = await Project.findById(projectId);
    
    if (!project || project.supervisor.toString() !== req.session.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      });
    }
    
    const selectedTopic = project.proposedTopics[topicIndex];
    
    if (!selectedTopic) {
      return res.status(404).json({ 
        success: false, 
        message: 'موضوع یافت نشد' 
      });
    }
    
    project.topic = selectedTopic.topic;
    project.status = 'in_progress';
    await project.save();
    
    res.json({ 
      success: true, 
      message: 'موضوع تایید شد' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// مشاهده گزارشات دانشجو
exports.getReports = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate('student');
    
    if (!project || project.supervisor.toString() !== req.session.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      });
    }
    
    res.json({ 
      success: true, 
      reports: project.reports,
      student: project.student 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// پیشنهاد زمان دفاعیه (استاد داور)
exports.proposeDefenseTime = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    
    const timeSlot = new DefenseTimeSlot({
      professor: req.session.user.id,
      date: new Date(date),
      startTime,
      endTime,
      status: 'proposed'
    });
    
    await timeSlot.save();
    
    res.json({ 
      success: true, 
      message: 'زمان پیشنهادی ثبت شد' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// دریافت زمان‌های پیشنهادی
exports.getProposedTimes = async (req, res) => {
  try {
    const timeSlots = await DefenseTimeSlot.find({ 
      professor: req.session.user.id 
    }).sort('date');
    
    res.json({ 
      success: true, 
      timeSlots 
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
      fromModel: 'Professor',
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

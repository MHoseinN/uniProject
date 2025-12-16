const Message = require('../models/Inbox');
const User = require('../models/User');
const { logAction } = require('../utils/logger');

/**
 * ارسال پیام
 * POST /messages/send
 */
async function sendMessage(req, res) {
  try {
    const { to, subject, content, relatedProject } = req.body;
    const fromUserId = req.userId;
    
    // بررسی وجود گیرنده
    const recipient = await User.findById(to);
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'کاربر مقصد یافت نشد'
      });
    }
    
    // ایجاد پیام
    const message = await Message.create({
      from: fromUserId,
      to,
      subject,
      content,
      relatedProject: relatedProject || null,
      sentAt: new Date()
    });
    
    // Populate برای بازگشت اطلاعات کامل
    await message.populate('from', 'firstName lastName role');
    await message.populate('to', 'firstName lastName role');
    
    // ثبت لاگ
    await logAction('MESSAGE_SENT', fromUserId, {
      targetUser: to,
      details: { subject },
      ipAddress: req.ip
    });
    
    return res.status(201).json({
      success: true,
      message: 'پیام با موفقیت ارسال شد',
      data: message
    });
  } catch (error) {
    console.error('خطا در ارسال پیام:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * دریافت صندوق ورودی
 * GET /messages/inbox
 */
async function getInbox(req, res) {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { to: userId };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const messages = await Message.find(query)
      .populate('from', 'firstName lastName role')
      .populate('relatedProject', 'projectCode')
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const totalCount = await Message.countDocuments(query);
    const unreadCount = await Message.countDocuments({ to: userId, isRead: false });
    
    return res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('خطا در دریافت صندوق ورودی:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * دریافت صندوق خروجی
 * GET /messages/sent
 */
async function getSentMessages(req, res) {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    
    const messages = await Message.find({ from: userId })
      .populate('to', 'firstName lastName role')
      .populate('relatedProject', 'projectCode')
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const totalCount = await Message.countDocuments({ from: userId });
    
    return res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('خطا در دریافت صندوق خروجی:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * علامت‌گذاری به عنوان خوانده شده
 * PUT /messages/:messageId/read
 */
async function markAsRead(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.userId;
    
    const message = await Message.findOne({ _id: messageId, to: userId });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'پیام یافت نشد'
      });
    }
    
    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }
    
    return res.json({
      success: true,
      message: 'پیام به عنوان خوانده شده علامت‌گذاری شد'
    });
  } catch (error) {
    console.error('خطا در علامت‌گذاری پیام:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * حذف پیام
 * DELETE /messages/:messageId
 */
async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.userId;
    
    // پیام فقط برای گیرنده قابل حذف است
    const message = await Message.findOne({ _id: messageId, to: userId });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'پیام یافت نشد'
      });
    }
    
    await message.deleteOne();
    
    return res.json({
      success: true,
      message: 'پیام حذف شد'
    });
  } catch (error) {
    console.error('خطا در حذف پیام:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * دریافت مکالمه با یک کاربر خاص
 * GET /messages/conversation/:userId
 */
async function getConversation(req, res) {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.userId;
    
    // بررسی وجود کاربر
    const otherUser = await User.findById(otherUserId).select('firstName lastName role');
    
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    // دریافت تمام پیام‌های بین دو کاربر
    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId }
      ]
    })
    .populate('from', 'firstName lastName role')
    .populate('to', 'firstName lastName role')
    .populate('relatedProject', 'projectCode')
    .sort({ sentAt: 1 });
    
    // علامت‌گذاری پیام‌های خوانده نشده از طرف مقابل
    await Message.updateMany(
      { from: otherUserId, to: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    return res.json({
      success: true,
      conversation: {
        with: otherUser,
        messages
      }
    });
  } catch (error) {
    console.error('خطا در دریافت مکالمه:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

/**
 * دریافت لیست مکالمات (کاربرانی که با آنها پیام رد و بدل شده)
 * GET /messages/conversations
 */
async function getConversations(req, res) {
  try {
    const userId = req.userId;
    
    // پیدا کردن تمام کاربرانی که با آنها پیام رد و بدل شده
    const sentTo = await Message.distinct('to', { from: userId });
    const receivedFrom = await Message.distinct('from', { to: userId });
    
    const allUserIds = [...new Set([...sentTo, ...receivedFrom])];
    
    // دریافت اطلاعات کاربران و آخرین پیام
    const conversations = await Promise.all(
      allUserIds.map(async (otherUserId) => {
        const otherUser = await User.findById(otherUserId).select('firstName lastName role');
        
        const lastMessage = await Message.findOne({
          $or: [
            { from: userId, to: otherUserId },
            { from: otherUserId, to: userId }
          ]
        })
        .sort({ sentAt: -1 })
        .select('subject content sentAt isRead from');
        
        const unreadCount = await Message.countDocuments({
          from: otherUserId,
          to: userId,
          isRead: false
        });
        
        return {
          user: otherUser,
          lastMessage,
          unreadCount
        };
      })
    );
    
    // مرتب‌سازی بر اساس آخرین پیام
    conversations.sort((a, b) => 
      new Date(b.lastMessage?.sentAt || 0) - new Date(a.lastMessage?.sentAt || 0)
    );
    
    return res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('خطا در دریافت مکالمات:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
}

module.exports = {
  sendMessage,
  getInbox,
  getSentMessages,
  markAsRead,
  deleteMessage,
  getConversation,
  getConversations
};

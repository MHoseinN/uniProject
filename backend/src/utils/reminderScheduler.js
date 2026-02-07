const cron = require('node-cron');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

// Check for reservations that need return reminder (1 hour before end time)
async function checkReturnReminders() {
    try {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

        console.log('Checking for return reminders...');

        // Find reservations that:
        // 1. End date is within the next hour
        // 2. Are received but not returned
        // 3. Haven't already received a reminder today
        const reservations = await Reservation.find({
            received: true,
            returned: false,
            endDate: {
                $gte: now,
                $lte: oneHourLater
            }
        }).populate('user');

        for (const reservation of reservations) {
            const user = reservation.user;
            if (!user) continue;

            // Check if reminder already sent today
            const today = new Date().toDateString();
            const lastMessage = user.messages[user.messages.length - 1];
            const reminderText = `⏰ به زمان برگشت تجهیزات شما با کد رهگیری ${reservation.trackingCode} یک ساعت مانده. لطفاً فراموش نکنید.`;

            // Don't send duplicate reminders on the same day
            if (lastMessage &&
                lastMessage.text.includes('یک ساعت مانده') &&
                lastMessage.createdAt.toDateString() === today) {
                continue;
            }

            // Send reminder message
            user.messages.push({
                text: reminderText,
                createdAt: new Date()
            });

            await user.save();
            console.log(`Reminder sent to user ${user.firstName} ${user.lastName} for reservation ${reservation.trackingCode}`);
        }
    } catch (error) {
        console.error('Error checking return reminders:', error);
    }
}

// Schedule the reminder check to run every hour
function startReminderScheduler() {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', checkReturnReminders);
    console.log('Return reminder scheduler started - will run every hour');
}

module.exports = {
    startReminderScheduler,
    checkReturnReminders
};

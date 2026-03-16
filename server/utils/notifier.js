const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });
  }
  return transporter;
};

const sendNotification = async (email, subject, body) => {
  try {
    await getTransporter().sendMail({
      from: `"TaskDone" <${process.env.MAIL_USER}>`,
      to: email,
      subject,
      text: body,
    });
    console.log(`Notification sent to ${email}`);
  } catch (error) {
    console.error(`Notification failed: ${error.message}`);
  }
};

const notifyTaskAssigned = (email, task, workerName) =>
  sendNotification(email, `TaskDone: Worker assigned to "${task.title}"`,
    `Your task "${task.title}" has been picked up by ${workerName}.\n\nTask ID: ${task._id}\nExpected time: ~${task.estimatedMinutes} minutes\n\nLog into TaskDone to chat with your worker.`);

const notifyTaskCompleted = (email, task) =>
  sendNotification(email, `TaskDone: "${task.title}" completed!`,
    `Your task "${task.title}" has been marked as complete.\n\nTask ID: ${task._id}\n\nLog into TaskDone to review the proof and approve.`);

const notifyNewTaskAvailable = (email, task) =>
  sendNotification(email, `TaskDone: New task available — "${task.title}"`,
    `A new ${task.type} task is available.\n\nTitle: ${task.title}\nPriority: ${task.priority}\nPayout: ₹${task.payout}\n\nLog into TaskDone to claim it.`);

const notifyRevisionRequested = (email, task, reason) =>
  sendNotification(email, `TaskDone: Revision requested for "${task.title}"`,
    `The client has requested a revision.\n\nTask: ${task.title}\nReason: ${reason}\n\nLog into TaskDone to address this.`);

module.exports = { sendNotification, notifyTaskAssigned, notifyTaskCompleted, notifyNewTaskAvailable, notifyRevisionRequested };

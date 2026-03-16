// WhatsApp integration via Twilio
// In production, replace with WhatsApp Business API or Twilio

const sendWhatsAppMessage = async (to, message) => {
  // Normalize phone number
  const phone = to.startsWith('+') ? to : `+91${to.replace(/\D/g, '')}`;

  try {
    if (process.env.TWILIO_SID && process.env.TWILIO_SID !== 'your_twilio_sid') {
      const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${phone}`,
      });
      console.log(`WhatsApp sent to ${phone}`);
    } else {
      console.log(`[WhatsApp Mock] To: ${phone}\n${message}`);
    }
    return true;
  } catch (error) {
    console.error(`WhatsApp failed: ${error.message}`);
    return false;
  }
};

const sendOnboardingMessage = (phone, name) =>
  sendWhatsAppMessage(phone,
    `Hi ${name}! Welcome to *TaskDone* — We apply to jobs for you.\n\n` +
    `To get started, we need:\n` +
    `1. Your updated resume (PDF)\n` +
    `2. Job preferences (roles, locations, salary)\n` +
    `3. Portal credentials (Naukri/LinkedIn)\n\n` +
    `Reply with your resume or type HELP for options.\n\n` +
    `— Team TaskDone`);

const sendDailyUpdate = (phone, name, applied, total, topCompanies) =>
  sendWhatsAppMessage(phone,
    `Hi ${name}! Here's your daily update:\n\n` +
    `Applications today: *${applied}*\n` +
    `Total so far: *${total}*\n\n` +
    `Top companies applied to:\n${topCompanies.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n` +
    `Full report in your dashboard.\n— Team TaskDone`);

const sendInterviewAlert = (phone, name, company, role) =>
  sendWhatsAppMessage(phone,
    `Great news ${name}!\n\n` +
    `You've received an *interview call* from *${company}* for *${role}*!\n\n` +
    `Update us on how it goes. Good luck!\n— Team TaskDone`);

const sendWeeklyReport = (phone, name, weekApplied, totalApplied, interviews, reportLink) =>
  sendWhatsAppMessage(phone,
    `Hi ${name}! Weekly Report:\n\n` +
    `This week: *${weekApplied} applications*\n` +
    `Total: *${totalApplied} applications*\n` +
    `Interview calls: *${interviews}*\n\n` +
    `Download full report: ${reportLink}\n\n` +
    `Keep going — consistency wins!\n— Team TaskDone`);

const sendGuaranteeReminder = (phone, name, received, target, daysLeft) =>
  sendWhatsAppMessage(phone,
    `Hi ${name}! Interview guarantee update:\n\n` +
    `Calls received: *${received}/${target}*\n` +
    `Days remaining: *${daysLeft}*\n\n` +
    `${received >= target
      ? 'You\'ve hit the target! Keep the momentum going.'
      : `We're working hard to hit ${target} calls for you. If we don't make it, next month is on us.`}\n\n` +
    `— Team TaskDone`);

module.exports = {
  sendWhatsAppMessage,
  sendOnboardingMessage,
  sendDailyUpdate,
  sendInterviewAlert,
  sendWeeklyReport,
  sendGuaranteeReminder,
};

const mongoose = require('mongoose');

// Each individual job application
const applicationSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  portal: { type: String, enum: ['naukri', 'linkedin', 'indeed', 'internshala', 'freshersworld', 'company_website', 'email', 'other'], required: true },
  jobUrl: { type: String, default: '' },
  location: { type: String, default: '' },
  salary: { type: String, default: '' },
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['applied', 'viewed', 'shortlisted', 'interview_scheduled', 'rejected', 'no_response'],
    default: 'applied',
  },
  coverLetterUsed: { type: Boolean, default: false },
  screenshot: { type: String, default: '' },
  notes: { type: String, default: '' },
});

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['client', 'worker', 'admin', 'system'] },
  text: { type: String, required: true },
  attachments: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
});

// An "order" = a batch of applications (e.g. "Apply to 50 jobs")
const orderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Order details
  plan: { type: String, required: true },
  serviceMode: {
    type: String,
    enum: ['portal', 'direct'],
    default: 'portal',
  },
  totalApplications: { type: Number, required: true },
  completedApplications: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'paused', 'review_pending', 'completed', 'cancelled'],
    default: 'pending',
  },

  // Job preferences for this order
  preferences: {
    roles: [{ type: String }],
    keywords: [{ type: String }],
    locations: [{ type: String }],
    portals: [{ type: String }],
    experienceLevel: { type: String, default: '' },
    salaryRange: { type: String, default: '' },
    remoteOnly: { type: Boolean, default: false },
    customInstructions: { type: String, default: '' },
  },

  // Applications
  applications: [applicationSchema],

  // Email outreach (for direct mode)
  emailOutreach: [{
    recipientName: { type: String, default: '' },
    recipientEmail: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, default: '' },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'opened', 'replied', 'bounced'], default: 'sent' },
    screenshot: { type: String, default: '' },
    notes: { type: String, default: '' },
  }],
  totalEmailsSent: { type: Number, default: 0 },

  // Communication
  messages: [messageSchema],

  // Reports
  reports: [{
    type: { type: String, enum: ['daily', 'weekly'] },
    pdfUrl: { type: String },
    excelUrl: { type: String },
    generatedAt: { type: Date, default: Date.now },
    applicationCount: { type: Number },
  }],

  // Worker payout
  payout: { type: Number, default: 0 },
  workerNotes: { type: String, default: '' },

  // Client feedback
  clientRating: { type: Number, min: 1, max: 5 },
  clientReview: { type: String, default: '' },

  // Interview tracking
  interviewCalls: { type: Number, default: 0 },

  // Dates
  assignedAt: Date,
  startedAt: Date,
  completedAt: Date,
  nextReportDue: Date,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['client', 'worker', 'admin'], default: 'client' },

  // Subscription
  plan: { type: String, enum: ['free', 'starter', 'pro', 'max'], default: 'free' },
  planStartDate: { type: Date, default: Date.now },
  planEndDate: { type: Date },
  applicationsUsed: { type: Number, default: 0 },
  applicationsLimit: { type: Number, default: 5 },
  interviewCallsReceived: { type: Number, default: 0 },
  guaranteeEligible: { type: Boolean, default: false },

  // Job seeker profile
  profile: {
    headline: { type: String, default: '' },
    experience: { type: String, enum: ['fresher', '0-1', '1-3', '3-5', '5-10', '10+'], default: 'fresher' },
    skills: [{ type: String }],
    preferredRoles: [{ type: String }],
    preferredLocations: [{ type: String }],
    currentLocation: { type: String, default: '' },
    expectedSalary: { type: String, default: '' },
    noticePeriod: { type: String, default: '' },
    education: { type: String, default: '' },
    college: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    openToRemote: { type: Boolean, default: true },
    openToRelocate: { type: Boolean, default: false },
  },

  // Portal credentials (encrypted)
  vault: {
    encryptedData: { type: String, default: '' },
  },

  // Onboarding
  onboardingComplete: { type: Boolean, default: false },
  onboardingSource: { type: String, enum: ['web', 'whatsapp', 'referral'], default: 'web' },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Worker-specific
  workerProfile: {
    rating: { type: Number, default: 5.0 },
    totalCompleted: { type: Number, default: 0 },
    totalApplicationsFiled: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
    maxConcurrentOrders: { type: Number, default: 3 },
    currentOrders: { type: Number, default: 0 },
    specialization: [{ type: String }],
    verified: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

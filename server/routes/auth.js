const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const plans = require('../config/plans');
const { sendOnboardingMessage } = require('../utils/whatsapp');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role = 'client', experience, skills, preferredRoles, preferredLocations } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    if (!['client', 'worker'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const userData = {
      name, email, passwordHash, role,
      phone: phone || '',
      whatsapp: phone || '',
    };

    if (role === 'client') {
      const freePlan = plans.free;
      userData.plan = 'free';
      userData.applicationsLimit = freePlan.applications;
      userData.planEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      if (experience) userData.profile = { experience };
      if (skills) userData.profile = { ...userData.profile, skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()) };
      if (preferredRoles) userData.profile = { ...userData.profile, preferredRoles: Array.isArray(preferredRoles) ? preferredRoles : preferredRoles.split(',').map(s => s.trim()) };
      if (preferredLocations) userData.profile = { ...userData.profile, preferredLocations: Array.isArray(preferredLocations) ? preferredLocations : preferredLocations.split(',').map(s => s.trim()) };
    }

    if (role === 'worker') {
      userData.workerProfile = {
        specialization: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [],
      };
    }

    const user = await User.create(userData);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Send WhatsApp onboarding
    if (phone && role === 'client') {
      sendOnboardingMessage(phone, name).catch(() => {});
    }

    res.status(201).json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, phone: user.phone,
        role: user.role, plan: user.plan,
        applicationsUsed: user.applicationsUsed,
        applicationsLimit: user.applicationsLimit,
        profile: user.profile,
        onboardingComplete: user.onboardingComplete,
        workerProfile: role === 'worker' ? user.workerProfile : undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, phone: user.phone,
        role: user.role, plan: user.plan,
        applicationsUsed: user.applicationsUsed,
        applicationsLimit: user.applicationsLimit,
        profile: user.profile,
        onboardingComplete: user.onboardingComplete,
        workerProfile: user.role === 'worker' ? user.workerProfile : undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Me
router.get('/me', auth, async (req, res) => {
  const u = req.user;
  res.json({
    id: u._id, name: u.name, email: u.email, phone: u.phone,
    role: u.role, plan: u.plan,
    applicationsUsed: u.applicationsUsed,
    applicationsLimit: u.applicationsLimit,
    interviewCallsReceived: u.interviewCallsReceived,
    guaranteeEligible: u.guaranteeEligible,
    profile: u.profile,
    onboardingComplete: u.onboardingComplete,
    planStartDate: u.planStartDate,
    planEndDate: u.planEndDate,
    workerProfile: u.role === 'worker' ? u.workerProfile : undefined,
    createdAt: u.createdAt,
  });
});

module.exports = router;

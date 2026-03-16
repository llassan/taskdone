const express = require('express');
const multer = require('multer');
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const VaultService = require('../services/VaultService');
const plans = require('../config/plans');
const { parseResume } = require('../utils/resumeParser');

const router = express.Router();

// Multer for resume upload (memory storage — we only need the buffer)
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
  },
});

// Parse resume and extract profile data
router.post('/parse-resume', resumeUpload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No resume file uploaded' });

    const parsed = await parseResume(req.file.buffer, req.file.originalname);

    // Generate a headline from education + top skills
    if (!parsed.headline && (parsed.education || parsed.skills.length > 0)) {
      const parts = [];
      if (parsed.education) parts.push(parsed.education);
      if (parsed.college) parts.push(parsed.college);
      if (parsed.skills.length > 0) parts.push(parsed.skills.slice(0, 3).join(' & '));
      parsed.headline = parts.join(' | ');
    }

    res.json(parsed);
  } catch (error) {
    console.error('Resume parse error:', error);
    res.status(500).json({ error: 'Failed to parse resume. Try a different file format.' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, whatsapp, headline, experience, skills, preferredRoles, preferredLocations,
      currentLocation, expectedSalary, noticePeriod, education, college, resumeUrl,
      linkedinUrl, portfolioUrl, openToRemote, openToRelocate } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (whatsapp) updates.whatsapp = whatsapp;
    if (headline) updates['profile.headline'] = headline;
    if (experience) updates['profile.experience'] = experience;
    if (skills) updates['profile.skills'] = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (preferredRoles) updates['profile.preferredRoles'] = Array.isArray(preferredRoles) ? preferredRoles : preferredRoles.split(',').map(s => s.trim());
    if (preferredLocations) updates['profile.preferredLocations'] = Array.isArray(preferredLocations) ? preferredLocations : preferredLocations.split(',').map(s => s.trim());
    if (currentLocation) updates['profile.currentLocation'] = currentLocation;
    if (expectedSalary) updates['profile.expectedSalary'] = expectedSalary;
    if (noticePeriod) updates['profile.noticePeriod'] = noticePeriod;
    if (education) updates['profile.education'] = education;
    if (college) updates['profile.college'] = college;
    if (resumeUrl) updates['profile.resumeUrl'] = resumeUrl;
    if (linkedinUrl) updates['profile.linkedinUrl'] = linkedinUrl;
    if (portfolioUrl) updates['profile.portfolioUrl'] = portfolioUrl;
    if (openToRemote !== undefined) updates['profile.openToRemote'] = openToRemote;
    if (openToRelocate !== undefined) updates['profile.openToRelocate'] = openToRelocate;

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });
    res.json({ id: user._id, name: user.name, profile: user.profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete onboarding
router.post('/onboarding', auth, requireRole('client'), async (req, res) => {
  try {
    const { headline, experience, skills, preferredRoles, preferredLocations,
      expectedSalary, education, college, resumeUrl, linkedinUrl, openToRemote } = req.body;

    await User.findByIdAndUpdate(req.userId, {
      onboardingComplete: true,
      'profile.headline': headline || '',
      'profile.experience': experience || 'fresher',
      'profile.skills': skills || [],
      'profile.preferredRoles': preferredRoles || [],
      'profile.preferredLocations': preferredLocations || [],
      'profile.expectedSalary': expectedSalary || '',
      'profile.education': education || '',
      'profile.college': college || '',
      'profile.resumeUrl': resumeUrl || '',
      'profile.linkedinUrl': linkedinUrl || '',
      'profile.openToRemote': openToRemote || false,
    });

    res.json({ message: 'Onboarding complete', onboardingComplete: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vault
router.post('/vault', auth, requireRole('client'), async (req, res) => {
  try {
    const { credentials } = req.body;
    if (!credentials) return res.status(400).json({ error: 'Credentials required' });
    await VaultService.storeCredentials(req.userId, credentials);
    res.json({ message: 'Credentials stored securely' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vault/keys', auth, requireRole('client'), async (req, res) => {
  try {
    const creds = await VaultService.getCredentials(req.userId);
    res.json({ keys: Object.keys(creds) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/vault/:key', auth, requireRole('client'), async (req, res) => {
  try {
    await VaultService.deleteCredential(req.userId, req.params.key);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Plans
router.get('/plans', (req, res) => res.json(plans));

// Upgrade
router.post('/upgrade', auth, requireRole('client'), async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plans[plan]) return res.status(400).json({ error: 'Invalid plan' });

    const p = plans[plan];
    await User.findByIdAndUpdate(req.userId, {
      plan,
      applicationsUsed: 0,
      applicationsLimit: p.applications,
      planStartDate: new Date(),
      planEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      guaranteeEligible: p.interviewGuarantee || false,
    });

    res.json({ message: `Upgraded to ${p.name}`, plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Worker earnings
router.get('/earnings', auth, requireRole('worker'), async (req, res) => {
  try {
    const w = req.user.workerProfile;
    res.json({
      totalEarnings: w.totalEarnings,
      totalCompleted: w.totalCompleted,
      totalApplicationsFiled: w.totalApplicationsFiled,
      rating: w.rating,
      currentOrders: w.currentOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

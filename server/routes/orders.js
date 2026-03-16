const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requireRole } = require('../middleware/auth');
const Order = require('../models/Task');
const User = require('../models/User');
const plans = require('../config/plans');
const { generateWeeklyPdf, generateExcelReport } = require('../utils/reportGenerator');
const { sendDailyUpdate, sendInterviewAlert } = require('../utils/whatsapp');

const router = express.Router();

// Multer for screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', `order-${req.params.id || 'temp'}`, 'screenshots');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── CLIENT: Create order ──
router.post('/', auth, requireRole('client'), async (req, res) => {
  try {
    const user = req.user;
    const userPlan = plans[user.plan];
    if (!userPlan) return res.status(400).json({ error: 'Invalid plan' });

    if (user.applicationsUsed >= user.applicationsLimit) {
      return res.status(403).json({
        error: 'Application limit reached. Upgrade your plan.',
        used: user.applicationsUsed,
        limit: user.applicationsLimit,
        plan: user.plan,
      });
    }

    const { preferences, serviceMode } = req.body;
    const remaining = user.applicationsLimit - user.applicationsUsed;

    // Worker payout: ~40% of plan price
    const payoutMap = { free: 0, starter: 200, pro: 400, max: 800, mega: 1000 };

    const order = await Order.create({
      clientId: req.userId,
      plan: user.plan,
      serviceMode: serviceMode || 'portal',
      totalApplications: remaining,
      preferences: {
        roles: preferences?.roles || user.profile?.preferredRoles || [],
        keywords: preferences?.keywords || [],
        locations: preferences?.locations || user.profile?.preferredLocations || [],
        portals: serviceMode === 'direct'
          ? ['company_website', 'email']
          : (preferences?.portals || ['naukri', 'linkedin', 'indeed']),
        experienceLevel: preferences?.experienceLevel || user.profile?.experience || 'fresher',
        salaryRange: preferences?.salaryRange || user.profile?.expectedSalary || '',
        remoteOnly: preferences?.remoteOnly || false,
        customInstructions: preferences?.customInstructions || '',
      },
      payout: payoutMap[user.plan] || 200,
      nextReportDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Notify workers
    const io = req.app.get('io');
    if (io) io.emit('new-order', { orderId: order._id, plan: order.plan, applications: order.totalApplications });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── CLIENT: My orders ──
router.get('/my', auth, requireRole('client'), async (req, res) => {
  try {
    const orders = await Order.find({ clientId: req.userId })
      .populate('workerId', 'name workerProfile.rating workerProfile.totalCompleted')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── WORKER: Available orders ──
router.get('/available', auth, requireRole('worker'), async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' })
      .select('-messages -applications')
      .sort({ createdAt: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── WORKER: My assigned orders ──
router.get('/assigned', auth, requireRole('worker'), async (req, res) => {
  try {
    const orders = await Order.find({ workerId: req.userId })
      .populate('clientId', 'name email phone profile')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── WORKER: Claim order ──
router.patch('/:id/claim', auth, requireRole('worker'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Order already taken' });

    const worker = req.user;
    if (worker.workerProfile.currentOrders >= worker.workerProfile.maxConcurrentOrders) {
      return res.status(400).json({ error: 'Max concurrent orders reached' });
    }

    order.workerId = req.userId;
    order.status = 'assigned';
    order.assignedAt = new Date();
    await order.save();

    await User.findByIdAndUpdate(req.userId, { $inc: { 'workerProfile.currentOrders': 1 } });

    const io = req.app.get('io');
    if (io) io.to(`order-${order._id}`).emit('order-update', { orderId: order._id, status: 'assigned' });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── WORKER: Start order ──
router.patch('/:id/start', auth, requireRole('worker'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, workerId: req.userId });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (!['assigned'].includes(order.status)) return res.status(400).json({ error: 'Cannot start' });

    order.status = 'in_progress';
    order.startedAt = new Date();
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── WORKER: Log an application ──
router.post('/:id/application', auth, requireRole('worker'), upload.single('screenshot'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, workerId: req.userId });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.status !== 'in_progress') return res.status(400).json({ error: 'Order not in progress' });
    if (order.completedApplications >= order.totalApplications) {
      return res.status(400).json({ error: 'All applications already completed' });
    }

    const screenshot = req.file ? `/uploads/order-${order._id}/screenshots/${req.file.filename}` : '';

    const application = {
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      portal: req.body.portal,
      jobUrl: req.body.jobUrl || '',
      location: req.body.location || '',
      salary: req.body.salary || '',
      coverLetterUsed: req.body.coverLetterUsed === 'true',
      screenshot,
      notes: req.body.notes || '',
    };

    order.applications.push(application);
    order.completedApplications += 1;
    await order.save();

    // Update client's usage
    await User.findByIdAndUpdate(order.clientId, { $inc: { applicationsUsed: 1 } });

    const io = req.app.get('io');
    if (io) io.to(`order-${order._id}`).emit('application-added', {
      orderId: order._id,
      application,
      completed: order.completedApplications,
      total: order.totalApplications,
    });

    res.json({ application, completedApplications: order.completedApplications, totalApplications: order.totalApplications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── WORKER: Log an email outreach (direct mode) ──
router.post('/:id/email-outreach', auth, requireRole('worker'), upload.single('screenshot'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, workerId: req.userId });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.status !== 'in_progress') return res.status(400).json({ error: 'Order not in progress' });

    const screenshot = req.file ? `/uploads/order-${order._id}/screenshots/${req.file.filename}` : '';

    const emailEntry = {
      recipientName: req.body.recipientName || '',
      recipientEmail: req.body.recipientEmail,
      company: req.body.company,
      role: req.body.role || '',
      screenshot,
      notes: req.body.notes || '',
    };

    order.emailOutreach.push(emailEntry);
    order.totalEmailsSent = (order.totalEmailsSent || 0) + 1;
    order.completedApplications += 1;
    await order.save();

    await User.findByIdAndUpdate(order.clientId, { $inc: { applicationsUsed: 1 } });

    const io = req.app.get('io');
    if (io) io.to(`order-${order._id}`).emit('email-sent', {
      orderId: order._id,
      email: emailEntry,
      completed: order.completedApplications,
      total: order.totalApplications,
    });

    res.json({ email: emailEntry, completedApplications: order.completedApplications, totalApplications: order.totalApplications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── WORKER: Mark complete ──
router.patch('/:id/complete', auth, requireRole('worker'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, workerId: req.userId });
    if (!order) return res.status(404).json({ error: 'Not found' });

    order.status = 'review_pending';
    order.workerNotes = req.body.workerNotes || '';
    order.completedAt = new Date();
    await order.save();

    // Generate reports
    try {
      const client = await User.findById(order.clientId);
      const [pdfUrl, excelUrl] = await Promise.all([
        generateWeeklyPdf(order, client?.name || 'Client'),
        generateExcelReport(order, client?.name || 'Client'),
      ]);
      order.reports.push({ type: 'weekly', pdfUrl, excelUrl, applicationCount: order.completedApplications });
      await order.save();
    } catch (e) { console.error('Report generation failed:', e.message); }

    await User.findByIdAndUpdate(req.userId, { $inc: { 'workerProfile.currentOrders': -1 } });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── CLIENT: Approve order ──
router.patch('/:id/approve', auth, requireRole('client'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, clientId: req.userId });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.status !== 'review_pending') return res.status(400).json({ error: 'Not pending review' });

    order.status = 'completed';
    order.clientRating = req.body.rating || 5;
    order.clientReview = req.body.review || '';
    await order.save();

    // Update worker stats
    if (order.workerId) {
      await User.findByIdAndUpdate(order.workerId, {
        $inc: {
          'workerProfile.totalCompleted': 1,
          'workerProfile.totalApplicationsFiled': order.completedApplications,
          'workerProfile.totalEarnings': order.payout,
        },
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── CLIENT: Log interview call ──
router.post('/:id/interview', auth, requireRole('client'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, clientId: req.userId });
    if (!order) return res.status(404).json({ error: 'Not found' });

    order.interviewCalls += 1;
    // Update the specific application status if provided
    if (req.body.applicationIndex !== undefined && order.applications[req.body.applicationIndex]) {
      order.applications[req.body.applicationIndex].status = 'interview_scheduled';
    }
    await order.save();

    // Update user's total interview count
    await User.findByIdAndUpdate(req.userId, { $inc: { interviewCallsReceived: 1 } });

    // Send WhatsApp alert
    const client = await User.findById(req.userId);
    if (client?.whatsapp && req.body.company) {
      sendInterviewAlert(client.whatsapp, client.name, req.body.company, req.body.role || 'the role').catch(() => {});
    }

    res.json({ interviewCalls: order.interviewCalls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Send message ──
router.post('/:id/message', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });

    const msg = { sender: req.userId, senderRole: req.user.role, text: req.body.text };
    order.messages.push(msg);
    await order.save();

    const io = req.app.get('io');
    if (io) io.to(`order-${order._id}`).emit('new-message', { orderId: order._id, message: { ...msg, senderName: req.user.name } });

    res.json(order.messages[order.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Generate report on demand ──
router.post('/:id/report', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });

    const client = await User.findById(order.clientId);
    const [pdfUrl, excelUrl] = await Promise.all([
      generateWeeklyPdf(order, client?.name || 'Client'),
      generateExcelReport(order, client?.name || 'Client'),
    ]);

    order.reports.push({ type: req.body.type || 'weekly', pdfUrl, excelUrl, applicationCount: order.completedApplications });
    await order.save();

    res.json({ pdfUrl, excelUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get single order ──
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('clientId', 'name email phone profile')
      .populate('workerId', 'name workerProfile.rating workerProfile.totalCompleted workerProfile.totalApplicationsFiled')
      .populate('messages.sender', 'name role');
    if (!order) return res.status(404).json({ error: 'Not found' });

    const isClient = order.clientId._id.toString() === req.userId.toString();
    const isWorker = order.workerId?._id?.toString() === req.userId.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isClient && !isWorker && !isAdmin) return res.status(403).json({ error: 'Access denied' });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Stats ──
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const field = req.user.role === 'worker' ? 'workerId' : 'clientId';
    const orders = await Order.find({ [field]: req.user._id });

    const totalApps = orders.reduce((sum, o) => sum + o.completedApplications, 0);
    const totalInterviews = orders.reduce((sum, o) => sum + o.interviewCalls, 0);
    const statusCounts = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

    res.json({
      totalOrders: orders.length,
      totalApplications: totalApps,
      totalInterviews,
      conversionRate: totalApps > 0 ? ((totalInterviews / totalApps) * 100).toFixed(1) : 0,
      statusCounts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

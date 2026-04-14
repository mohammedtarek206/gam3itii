const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const ActivityRegistration = require('../models/ActivityRegistration');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// GET /api/activities  - list all (public)
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const activities = await Activity.find(filter)
      .sort({ date: 1 })
      .populate('createdBy', 'name');

    res.json({ success: true, count: activities.length, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/activities/:id  - single activity (public)
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).populate('createdBy', 'name');
    if (!activity) return res.status(404).json({ success: false, message: 'النشاط غير موجود' });
    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PROTECTED (logged-in user) ───────────────────────────────────────────────

// POST /api/activities/:id/register  - user registers for activity
router.post('/:id/register', protect, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'النشاط غير موجود' });
    if (activity.status === 'cancelled') return res.status(400).json({ success: false, message: 'هذا النشاط ملغى' });
    if (activity.status === 'completed') return res.status(400).json({ success: false, message: 'انتهى هذا النشاط' });

    // Check max participants
    if (activity.maxParticipants > 0 && activity.registeredCount >= activity.maxParticipants) {
      return res.status(400).json({ success: false, message: 'اكتمل عدد المشاركين في هذا النشاط' });
    }

    // Check if already registered
    const existing = await ActivityRegistration.findOne({ activity: req.params.id, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'أنت مسجل في هذا النشاط بالفعل' });

    const { name, phone, email, notes } = req.body;
    const registration = await ActivityRegistration.create({
      activity: req.params.id,
      user: req.user._id,
      name: name || req.user.name,
      phone,
      email: email || req.user.email,
      notes,
    });

    // Increment count
    await Activity.findByIdAndUpdate(req.params.id, { $inc: { registeredCount: 1 } });

    // Send confirmation notification
    await Notification.create({
      user: req.user._id,
      title: '✅ تم تسجيلك في النشاط',
      message: `تم تسجيلك بنجاح في نشاط "${activity.title}" بتاريخ ${new Date(activity.date).toLocaleDateString('ar-EG')}`,
      type: 'activity_registered',
    });

    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'أنت مسجل في هذا النشاط بالفعل' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/activities/:id/register  - user cancels registration
router.delete('/:id/register', protect, async (req, res) => {
  try {
    const reg = await ActivityRegistration.findOneAndDelete({ activity: req.params.id, user: req.user._id });
    if (!reg) return res.status(404).json({ success: false, message: 'أنت لست مسجلاً في هذا النشاط' });
    await Activity.findByIdAndUpdate(req.params.id, { $inc: { registeredCount: -1 } });
    res.json({ success: true, message: 'تم إلغاء التسجيل' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/activities/my/registrations  - user's registered activities
router.get('/my/registrations', protect, async (req, res) => {
  try {
    const regs = await ActivityRegistration.find({ user: req.user._id })
      .populate('activity', 'title description date location category status')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: regs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// POST /api/activities  - admin creates activity
router.post('/', protect, admin, async (req, res) => {
  try {
    const activity = await Activity.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/activities/:id  - admin updates activity
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!activity) return res.status(404).json({ success: false, message: 'النشاط غير موجود' });
    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/activities/:id  - admin deletes activity
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    await ActivityRegistration.deleteMany({ activity: req.params.id });
    res.json({ success: true, message: 'تم حذف النشاط' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/activities/:id/registrations  - admin views registrations for an activity
router.get('/:id/registrations', protect, admin, async (req, res) => {
  try {
    const regs = await ActivityRegistration.find({ activity: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: regs.length, data: regs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

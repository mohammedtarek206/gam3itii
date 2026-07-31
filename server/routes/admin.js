const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Case = require('../models/Case');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Project = require('../models/Project');
const VolunteerApplication = require('../models/VolunteerApplication');
const { protect, admin, authorize } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const [users, cases, campaigns, donations, jobs, applications, projects, volunteers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Case.countDocuments(),
      Campaign.countDocuments(),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Job.countDocuments(),
      Application.countDocuments(),
      Project.countDocuments(),
      VolunteerApplication.countDocuments(),
    ]);
    const completedCases = await Case.countDocuments({ status: 'completed' });
    const urgentCases = await Case.countDocuments({ urgent: true });
    const currentProjects = await Project.countDocuments({ type: 'current' });
    const pastProjects = await Project.countDocuments({ type: 'past' });
    const pendingVolunteers = await VolunteerApplication.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        users,
        cases,
        completedCases,
        urgentCases,
        campaigns,
        totalDonations: donations[0]?.total || 0,
        donationCount: donations[0]?.count || 0,
        jobs,
        applications,
        projects,
        currentProjects,
        pastProjects,
        volunteers,
        pendingVolunteers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users
router.post('/users', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { name, email, password, phone, role, avatar } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل بالفعل' });

    user = await User.create({
      name, email, password, phone, role, avatar, isActive: true
    });
    const { password: pass, ...userData } = user._doc;
    res.status(201).json({ success: true, data: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { name, email, phone, role, avatar, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    // update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (avatar) user.avatar = avatar;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save(); // using save to hit pre-save hooks though password isn't modified

    const { password: pass, ...userData } = user._doc;
    res.json({ success: true, data: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/password
router.put('/users/:id/password', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    user.password = password;
    await user.save();

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', protect, authorize('superadmin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, data: user, message: user.isActive ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'لا يمكنك حذف حسابك الخاص' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف المستخدم' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

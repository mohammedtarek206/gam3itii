const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Case = require('../models/Case');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, admin } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const [users, cases, campaigns, donations, jobs, applications] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Case.countDocuments(),
      Campaign.countDocuments(),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);
    const completedCases = await Case.countDocuments({ status: 'completed' });
    const urgentCases = await Case.countDocuments({ urgent: true });
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

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف المستخدم' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

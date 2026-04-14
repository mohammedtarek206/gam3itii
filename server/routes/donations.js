const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Case = require('../models/Case');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');

// POST /api/donations
router.post('/', protect, async (req, res) => {
  try {
    const { caseId, campaignId, amount, method, recurring, anonymous } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ success: false, message: 'المبلغ غير صالح' });

    const donationData = {
      user: req.user._id,
      donorName: anonymous ? 'متبرع مجهول' : req.user.name,
      amount, method, recurring, anonymous,
    };
    if (caseId) donationData.case = caseId;
    if (campaignId) donationData.campaign = campaignId;

    const donation = await Donation.create(donationData);

    // Update case collected amount
    if (caseId) {
      await Case.findByIdAndUpdate(caseId, {
        $inc: { collectedAmount: amount },
        $push: { donors: { user: req.user._id, amount, date: new Date() } },
      });
    }
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, { $inc: { raised: amount } });
    }

    // Add points to user (1 point per 10 EGP)
    const pointsEarned = Math.floor(amount / 10);
    const user = await User.findById(req.user._id);
    user.points += pointsEarned;
    user.totalDonated += amount;

    // Assign badges
    if (user.totalDonated >= 1000 && !user.badges.includes('سفير الخير')) {
      user.badges.push('سفير الخير');
      await Notification.create({ user: user._id, title: 'تهانينا! 🎉', message: 'لقد حصلت على شارة "سفير الخير"', type: 'general' });
    } else if (user.totalDonated >= 100 && !user.badges.includes('فاعل خير')) {
      user.badges.push('فاعل خير');
      await Notification.create({ user: user._id, title: 'تهانينا! 🌟', message: 'لقد حصلت على شارة "فاعل خير"', type: 'general' });
    }
    await user.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, data: donation, pointsEarned });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/donations/my
router.get('/my', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user._id })
      .populate('case', 'title image')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/donations (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('user', 'name email')
      .populate('case', 'title')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: donations.length, data: donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

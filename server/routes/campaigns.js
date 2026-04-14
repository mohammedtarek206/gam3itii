const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const { protect, admin } = require('../middleware/auth');

// GET /api/campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('organizer', 'name').sort({ createdAt: -1 });
    res.json({ success: true, count: campaigns.length, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/campaigns/:id
router.get('/:id', async (req, res) => {
  try {
    const c = await Campaign.findById(req.params.id).populate('organizer', 'name').populate('cases');
    if (!c) return res.status(404).json({ success: false, message: 'الحملة غير موجودة' });
    res.json({ success: true, data: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/campaigns
router.post('/', protect, async (req, res) => {
  try {
    const c = await Campaign.create({ ...req.body, organizer: req.user._id });
    res.status(201).json({ success: true, data: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/campaigns/:id (Admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const c = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ success: false, message: 'الحملة غير موجودة' });
    res.json({ success: true, data: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/campaigns/:id (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف الحملة' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/campaigns/:id/share
router.post('/:id/share', async (req, res) => {
  try {
    const c = await Campaign.findByIdAndUpdate(req.params.id, { $inc: { shareCount: 1 } }, { new: true });
    res.json({ success: true, shareCount: c.shareCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

// GET activity logs (Admin/SuperAdmin only)
router.get('/', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const { action, entity, user, limit = 50 } = req.query;
    let query = {};
    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (user) query.user = user;

    const logs = await ActivityLog.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .populate('user', 'name email role');
      
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE all logs (SuperAdmin only) - Optional housekeeping
router.delete('/', protect, authorize('superadmin'), async (req, res) => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ success: true, message: 'تم مسح السجل بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

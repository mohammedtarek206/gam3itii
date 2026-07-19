const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// Helper to extract Google Drive ID
const extractDriveId = (url) => {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
};

// GET all media
router.get('/', protect, authorize('superadmin', 'admin', 'editor', 'content_manager'), async (req, res) => {
  try {
    const { folder, type, search } = req.query;
    let query = {};
    if (folder && folder !== 'all') query.folder = folder;
    if (type && type !== 'all') query.type = type;
    if (search) query.title = { $regex: search, $options: 'i' };

    const media = await Media.find(query).sort('-createdAt').populate('uploadedBy', 'name');
    res.json({ success: true, count: media.length, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add new media (Drive link or generic URL)
router.post('/', 
  protect, 
  authorize('superadmin', 'admin', 'editor', 'content_manager'),
  logActivity('Media', 'CREATE', (req, body) => `تم رفع وسائط جديدة: ${req.body.title}`),
  async (req, res) => {
    try {
      let { title, url, type, folder } = req.body;
      let driveId = null;

      if (url.includes('drive.google.com')) {
        driveId = extractDriveId(url);
        if (driveId) {
          url = `https://drive.google.com/uc?export=view&id=${driveId}`;
        }
      }

      const media = await Media.create({
        title,
        url,
        driveId,
        type: type || 'image',
        folder: folder || 'general',
        uploadedBy: req.user._id
      });

      res.status(201).json({ success: true, data: media });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE media
router.delete('/:id', 
  protect, 
  authorize('superadmin', 'admin', 'editor'),
  logActivity('Media', 'DELETE', (req) => `تم حذف وسائط بمعرف: ${req.params.id}`),
  async (req, res) => {
    try {
      const media = await Media.findByIdAndDelete(req.params.id);
      if (!media) return res.status(404).json({ success: false, message: 'غير موجود' });
      res.json({ success: true, data: {} });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

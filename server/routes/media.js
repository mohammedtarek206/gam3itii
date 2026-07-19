const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const { protect, authorize } = require('../middleware/auth');

// Helper to extract Google Drive ID and convert to direct URL
const convertDriveUrl = (url) => {
  if (!url || !url.includes('drive.google.com')) return url;
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  return url;
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
router.post('/', protect, authorize('superadmin', 'admin', 'editor', 'content_manager'), async (req, res) => {
  try {
    let { title, url, type, folder } = req.body;
    if (!title || !url) return res.status(400).json({ success: false, message: 'العنوان والرابط مطلوبان' });

    const convertedUrl = convertDriveUrl(url);

    const media = await Media.create({
      title,
      url: convertedUrl,
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
router.delete('/:id', protect, authorize('superadmin', 'admin', 'editor'), async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'غير موجود' });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

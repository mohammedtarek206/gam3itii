const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, admin } = require('../middleware/auth');

// Helper: Convert Google Drive share link to direct image URL
function convertGDriveUrl(url) {
  if (!url) return url;
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([^&]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }
  return url;
}

function processImages(images) {
  if (!images) return [];
  if (typeof images === 'string') {
    return [convertGDriveUrl(images)].filter(Boolean);
  }
  return images.map(convertGDriveUrl).filter(Boolean);
}

// GET /api/projects - Public
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type === 'current') filter.type = 'current';
    else if (type === 'past') filter.type = 'past';

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id - Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects - Admin only
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, type, startDate, endDate, images, mainImage, status, location, beneficiaries } = req.body;
    const processedImages = processImages(images);
    const processedMain = convertGDriveUrl(mainImage);

    const project = await Project.create({
      title, description, type, startDate, endDate,
      images: processedImages,
      mainImage: processedMain,
      status, location, beneficiaries
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:id - Admin only
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, description, type, startDate, endDate, images, mainImage, status, location, beneficiaries } = req.body;
    const processedImages = processImages(images);
    const processedMain = convertGDriveUrl(mainImage);

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, type, startDate, endDate, images: processedImages, mainImage: processedMain, status, location, beneficiaries, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id - Admin only
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    res.json({ success: true, message: 'تم حذف المشروع' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

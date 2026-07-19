const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// Helper: Convert Google Drive share link to direct image URL
function convertGDriveUrl(url) {
  if (!url) return url;
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  const openMatch = url.match(/[?&]id=([^&]+)/);
  if (openMatch) return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  return url;
}

function processUrls(urls) {
  if (!urls) return [];
  if (typeof urls === 'string') return [convertGDriveUrl(urls)].filter(Boolean);
  return urls.map(convertGDriveUrl).filter(Boolean);
}

// GET /api/projects - Public
router.get('/', async (req, res) => {
  try {
    const { type, includeHidden } = req.query;
    const filter = {};
    if (type === 'current') filter.type = 'current';
    else if (type === 'past') filter.type = 'past';
    
    // Only admins should be able to fetch hidden projects
    if (!includeHidden) {
      filter.isHidden = { $ne: true };
    }

    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id - Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || (project.isHidden && !req.user)) {
      return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects - Admin only
router.post('/', 
  protect, 
  authorize('superadmin', 'admin', 'content_manager'),
  logActivity('Project', 'CREATE', (req) => `تم إضافة مشروع جديد: ${req.body.title?.ar || 'بدون اسم'}`),
  async (req, res) => {
    try {
      const { title, description, type, startDate, endDate, images, mainImage, pdfLinks, videoLink, isHidden, order, status, location, beneficiaries } = req.body;
      
      const processedImages = processUrls(images);
      const processedPdfs = processUrls(pdfLinks);
      const processedMain = convertGDriveUrl(mainImage);
      // Ensure bilingual structure
      const finalTitle = typeof title === 'string' ? { ar: title, en: title } : title;
      const finalDesc = typeof description === 'string' ? { ar: description, en: description } : description;

      const project = await Project.create({
        title: finalTitle,
        description: finalDesc,
        type, startDate, endDate,
        images: processedImages,
        pdfLinks: processedPdfs,
        mainImage: processedMain,
        videoLink, isHidden, order, status, location, beneficiaries
      });
      res.status(201).json({ success: true, data: project });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/projects/:id - Admin only
router.put('/:id', 
  protect, 
  authorize('superadmin', 'admin', 'content_manager'),
  logActivity('Project', 'UPDATE', (req) => `تم تعديل مشروع: ${req.params.id}`),
  async (req, res) => {
    try {
      const { title, description, type, startDate, endDate, images, mainImage, pdfLinks, videoLink, isHidden, order, status, location, beneficiaries } = req.body;
      
      const processedImages = processUrls(images);
      const processedPdfs = processUrls(pdfLinks);
      const processedMain = convertGDriveUrl(mainImage);
      
      let updateData = { type, startDate, endDate, images: processedImages, pdfLinks: processedPdfs, mainImage: processedMain, videoLink, isHidden, order, status, location, beneficiaries, updatedAt: new Date() };
      
      if (title) updateData.title = typeof title === 'string' ? { ar: title, en: title } : title;
      if (description) updateData.description = typeof description === 'string' ? { ar: description, en: description } : description;

      const project = await Project.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!project) return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
      res.json({ success: true, data: project });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/projects/:id - Admin only
router.delete('/:id', 
  protect, 
  authorize('superadmin', 'admin'),
  logActivity('Project', 'DELETE', (req) => `تم حذف مشروع: ${req.params.id}`),
  async (req, res) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
      res.json({ success: true, message: 'تم حذف المشروع' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

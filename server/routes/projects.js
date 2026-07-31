const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, admin } = require('../middleware/auth');

// Helper: Convert any Google Drive share link to direct view URL (using lh3.googleusercontent.com to bypass limits)
function convertGDriveUrl(url) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim();
  if (!url) return '';

  // Handle already converted Google Photos format
  if (url.startsWith('https://lh3.googleusercontent.com/d/')) return url;

  // Extract FILE_ID
  let fileId = null;
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (fileMatch) fileId = fileMatch[1];
  else if (idMatch) fileId = idMatch[1];

  if (fileId) {
    // Return lh3 format which avoids GDrive strict limitations
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // If not a GDrive link at all, return original string (might be relative path or imgur etc.)
  return url;
}

function processUrls(input) {
  if (!input) return [];
  // Could be an array or newline-separated string from the form
  const arr = Array.isArray(input)
    ? input
    : String(input).split('\n');
  return arr.map(u => convertGDriveUrl(u)).filter(Boolean);
}

// GET /api/projects - Public
router.get('/', async (req, res) => {
  try {
    const { type, includeHidden } = req.query;
    const filter = {};
    if (type === 'current') filter.type = 'current';
    else if (type === 'past') filter.type = 'past';
    if (!includeHidden) filter.isHidden = { $ne: true };

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
    if (!project) return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects - Admin only
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      titleAr, titleEn, descAr, descEn,
      title, description,
      type, startDate, endDate,
      images, mainImage, pdfLinks, videoLink,
      isHidden, order, status, location, beneficiaries
    } = req.body;

    // Support both { titleAr, titleEn } format from dashboard and { title: {ar,en} } format
    const finalTitle = {
      ar: titleAr || title?.ar || title || '',
      en: titleEn || title?.en || ''
    };
    const finalDesc = {
      ar: descAr || description?.ar || description || '',
      en: descEn || description?.en || ''
    };

    const processedImages = processUrls(images);
    const processedPdfs = processUrls(pdfLinks);
    const processedMain = convertGDriveUrl(mainImage);

    const project = await Project.create({
      title: finalTitle,
      description: finalDesc,
      type: type || 'current',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      images: processedImages,
      pdfLinks: processedPdfs,
      mainImage: processedMain,
      videoLink: videoLink || '',
      isHidden: isHidden === true || isHidden === 'true',
      order: Number(order) || 0,
      status: status || 'active',
      location: location || '',
      beneficiaries: Number(beneficiaries) || 0
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    console.error('Project create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:id - Admin only
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const {
      titleAr, titleEn, descAr, descEn,
      title, description,
      type, startDate, endDate,
      images, mainImage, pdfLinks, videoLink,
      isHidden, order, status, location, beneficiaries
    } = req.body;

    const finalTitle = {
      ar: titleAr || title?.ar || '',
      en: titleEn || title?.en || ''
    };
    const finalDesc = {
      ar: descAr || description?.ar || '',
      en: descEn || description?.en || ''
    };

    const updateData = {
      title: finalTitle,
      description: finalDesc,
      type: type || 'current',
      images: processUrls(images),
      pdfLinks: processUrls(pdfLinks),
      mainImage: convertGDriveUrl(mainImage),
      videoLink: videoLink || '',
      isHidden: isHidden === true || isHidden === 'true',
      order: Number(order) || 0,
      status: status || 'active',
      location: location || '',
      beneficiaries: Number(beneficiaries) || 0,
      updatedAt: new Date()
    };

    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!project) return res.status(404).json({ success: false, message: 'المشروع غير موجود' });

    res.json({ success: true, data: project });
  } catch (err) {
    console.error('Project update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id - Admin only
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    res.json({ success: true, message: 'تم حذف المشروع بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

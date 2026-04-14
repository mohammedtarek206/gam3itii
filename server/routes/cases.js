const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Case = require('../models/Case');
const { protect, admin } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../uploads/cases');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `case-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/cases
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, urgent } = req.query;
    let query = {};
    if (category && category !== 'all') query.category = category;
    if (urgent === 'true') query.urgent = true;
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    let sortObj = { createdAt: -1 };
    if (sort === 'most_needed') sortObj = { collectedAmount: 1 };
    if (sort === 'amount') sortObj = { targetAmount: -1 };
    const cases = await Case.find(query).sort(sortObj);
    res.json({ success: true, count: cases.length, data: cases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/cases/:id
router.get('/:id', async (req, res) => {
  try {
    const c = await Case.findById(req.params.id).populate('donors.user', 'name');
    if (!c) return res.status(404).json({ success: false, message: 'الحالة غير موجودة' });
    res.json({ success: true, data: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cases (Admin)
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/cases/${req.file.filename}`;
    data.createdBy = req.user._id;
    const c = await Case.create(data);
    res.status(201).json({ success: true, data: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/cases/:id (Admin)
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/cases/${req.file.filename}`;
    const c = await Case.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!c) return res.status(404).json({ success: false, message: 'الحالة غير موجودة' });
    res.json({ success: true, data: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/cases/:id (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const c = await Case.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'الحالة غير موجودة' });
    res.json({ success: true, message: 'تم حذف الحالة' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

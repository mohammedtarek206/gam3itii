const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../uploads/cvs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `cv-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('يُسمح فقط بملفات PDF و Word'));
}});

// POST /api/applications (Apply for a job)
router.post('/', protect, upload.single('cv'), async (req, res) => {
  try {
    const { jobId, name, email, phone, coverLetter } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'الوظيفة غير موجودة' });
    if (job.status === 'closed') return res.status(400).json({ success: false, message: 'الوظيفة مغلقة' });

    const existing = await Application.findOne({ job: jobId, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'لقد تقدمت على هذه الوظيفة من قبل' });

    const appData = { job: jobId, user: req.user._id, name, email, phone, coverLetter };
    if (req.file) appData.cvFile = `/uploads/cvs/${req.file.filename}`;

    const application = await Application.create(appData);
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/applications/my
router.get('/my', protect, async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user._id })
      .populate('job', 'title location type')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/applications/job/:jobId (Admin)
router.get('/job/:jobId', protect, admin, async (req, res) => {
  try {
    const apps = await Application.find({ job: req.params.jobId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: apps.length, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/applications (Admin - all)
router.get('/', protect, admin, async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('job', 'title')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: apps.length, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/applications/:id/status (Admin - accept/reject)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const app = await Application.findByIdAndUpdate(req.params.id, { status, adminNote }, { new: true }).populate('user', 'name');
    if (!app) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

    // Send notification to applicant
    if (app.user) {
      const msg = status === 'accepted'
        ? `تهانينا! تم قبول طلبك على الوظيفة 🎉`
        : `نعتذر، لم يتم قبول طلبك على الوظيفة هذه المرة`;
      await Notification.create({
        user: app.user._id,
        title: status === 'accepted' ? 'تم قبول طلبك ✅' : 'نتيجة طلبك',
        message: msg,
        type: status === 'accepted' ? 'job_accepted' : 'job_rejected',
      });
    }

    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

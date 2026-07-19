const express = require('express');
const router = express.Router();
const VolunteerApplication = require('../models/VolunteerApplication');
const { protect, admin } = require('../middleware/auth');

// POST /api/volunteers - Submit volunteer application (public)
router.post('/', async (req, res) => {
  try {
    const {
      projectId, fullName, nationalId, email, phone,
      governorate, city, age, education, profession,
      skills, motivation, availableDays, cvFile
    } = req.body;

    if (!projectId || !fullName || !email || !phone || !governorate || !city || !age || !education || !motivation) {
      return res.status(400).json({ success: false, message: 'يرجى ملء جميع الحقول المطلوبة' });
    }

    const application = await VolunteerApplication.create({
      project: projectId,
      fullName, nationalId, email, phone,
      governorate, city,
      age: Number(age),
      education, profession, skills, motivation,
      availableDays: availableDays || [],
      cvFile
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/volunteers - Admin: get all applications
router.get('/', protect, admin, async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;
    if (status) filter.status = status;

    const apps = await VolunteerApplication.find(filter)
      .populate('project', 'title type')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: apps.length, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/volunteers/project/:projectId - Admin: get by project
router.get('/project/:projectId', protect, admin, async (req, res) => {
  try {
    const apps = await VolunteerApplication.find({ project: req.params.projectId })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: apps.length, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/volunteers/:id/status - Admin: update status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const app = await VolunteerApplication.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    );
    if (!app) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/volunteers/:id - Admin only
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await VolunteerApplication.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف الطلب' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

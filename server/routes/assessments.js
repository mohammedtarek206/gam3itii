const express = require('express');
const router = express.Router();
const { Assessment, AssessmentResponse } = require('../models/Assessment');
const { protect, admin } = require('../middleware/auth');

// GET /api/assessments/activity/:activityId - Get assessments for an activity
router.get('/activity/:activityId', protect, async (req, res) => {
  try {
    const assessments = await Assessment.find({ activity: req.params.activityId, isActive: true });
    res.json({ success: true, data: assessments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/assessments/activity/:activityId/stats - Admin: stats for an activity
router.get('/activity/:activityId/stats', protect, admin, async (req, res) => {
  try {
    const assessments = await Assessment.find({ activity: req.params.activityId });
    const stats = {};

    for (const assessment of assessments) {
      const responses = await AssessmentResponse.find({ assessment: assessment._id });
      const avg = responses.length
        ? responses.reduce((sum, r) => sum + r.percentage, 0) / responses.length
        : 0;
      stats[assessment.type] = {
        count: responses.length,
        avgScore: Math.round(avg * 10) / 10,
        passRate: responses.length
          ? Math.round((responses.filter(r => r.passed).length / responses.length) * 100)
          : 0
      };
    }

    // Calculate improvement if both pre and post exist
    if (stats.pre && stats.post) {
      stats.improvement = Math.round((stats.post.avgScore - stats.pre.avgScore) * 10) / 10;
    }

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/assessments/:id - Get single assessment (admin gets with answers, users get without)
router.get('/:id', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, message: 'الاختبار غير موجود' });

    if (req.user.role !== 'admin') {
      // Remove correct answers for non-admin
      const sanitized = assessment.toObject();
      sanitized.questions = sanitized.questions.map(q => ({ ...q, correctAnswer: undefined }));
      return res.json({ success: true, data: sanitized });
    }

    res.json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/assessments - Admin: create assessment
router.post('/', protect, admin, async (req, res) => {
  try {
    const { activity, type, title, questions, timeLimit, passingScore, isRequired } = req.body;

    // Check if assessment of this type already exists for this activity
    const existing = await Assessment.findOne({ activity, type });
    if (existing) {
      return res.status(400).json({ success: false, message: `يوجد اختبار ${type === 'pre' ? 'قبلي' : 'بعدي'} لهذا النشاط بالفعل` });
    }

    const assessment = await Assessment.create({
      activity, type, title, questions, timeLimit, passingScore, isRequired
    });
    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/assessments/:id - Admin: update assessment
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assessment) return res.status(404).json({ success: false, message: 'الاختبار غير موجود' });
    res.json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/assessments/:id - Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Assessment.findByIdAndDelete(req.params.id);
    await AssessmentResponse.deleteMany({ assessment: req.params.id });
    res.json({ success: true, message: 'تم حذف الاختبار' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/assessments/:id/submit - Submit assessment response
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, message: 'الاختبار غير موجود' });

    // Check if already submitted
    const existing = await AssessmentResponse.findOne({ assessment: assessment._id, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'لقد أجريت هذا الاختبار بالفعل' });

    const { answers } = req.body;
    let score = 0;
    let totalPoints = 0;

    // Calculate score
    assessment.questions.forEach(q => {
      totalPoints += q.points;
      const userAnswer = answers?.find(a => a.questionId?.toString() === q._id?.toString());
      if (userAnswer && q.correctAnswer) {
        if (userAnswer.answer?.toLowerCase()?.trim() === q.correctAnswer?.toLowerCase()?.trim()) {
          score += q.points;
        }
      }
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= assessment.passingScore;

    const response = await AssessmentResponse.create({
      assessment: assessment._id,
      user: req.user._id,
      activity: assessment.activity,
      answers: answers || [],
      score,
      totalPoints,
      percentage,
      passed
    });

    res.status(201).json({ success: true, data: { score, totalPoints, percentage, passed, response } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/assessments/:id/responses - Admin: get all responses
router.get('/:id/responses', protect, admin, async (req, res) => {
  try {
    const responses = await AssessmentResponse.find({ assessment: req.params.id })
      .populate('user', 'name email')
      .sort({ completedAt: -1 });
    res.json({ success: true, count: responses.length, data: responses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/assessments/:id/my-response - Check if user completed this assessment
router.get('/:id/my-response', protect, async (req, res) => {
  try {
    const response = await AssessmentResponse.findOne({ assessment: req.params.id, user: req.user._id });
    res.json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

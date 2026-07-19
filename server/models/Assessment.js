const mongoose = require('mongoose');

const assessmentQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'truefalse', 'short'], required: true },
  options: [{ type: String }], // For MCQ
  correctAnswer: { type: String }, // For MCQ & true/false
  points: { type: Number, default: 1 },
});

const assessmentSchema = new mongoose.Schema({
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  type: { type: String, enum: ['pre', 'post'], required: true }, // pre or post assessment
  title: { type: String, required: true },
  questions: [assessmentQuestionSchema],
  timeLimit: { type: Number, default: 30 }, // in minutes
  passingScore: { type: Number, default: 60 }, // percentage
  isRequired: { type: Boolean, default: false }, // If true, must complete before attending
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const assessmentResponseSchema = new mongoose.Schema({
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
  answers: [{ questionId: mongoose.Schema.Types.ObjectId, answer: String }],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  completedAt: { type: Date, default: Date.now },
});

const Assessment = mongoose.model('Assessment', assessmentSchema);
const AssessmentResponse = mongoose.model('AssessmentResponse', assessmentResponseSchema);

module.exports = { Assessment, AssessmentResponse };

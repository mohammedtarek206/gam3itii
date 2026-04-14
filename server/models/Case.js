const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  category: {
    type: String,
    enum: ['education', 'medical', 'zakat', 'construction', 'food', 'orphans', 'other'],
    default: 'other',
  },
  targetAmount: { type: Number, required: true },
  collectedAmount: { type: Number, default: 0 },
  urgent: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  beneficiaryName: { type: String },
  location: { type: String },
  successStory: { type: String },
  donors: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, amount: Number, date: Date }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

caseSchema.virtual('progressPercent').get(function () {
  return Math.min(Math.round((this.collectedAmount / this.targetAmount) * 100), 100);
});

caseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Case', caseSchema);

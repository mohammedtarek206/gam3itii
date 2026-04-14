const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  goal: { type: Number, required: true },
  raised: { type: Number, default: 0 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  endDate: { type: Date },
  shareCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

campaignSchema.virtual('progressPercent').get(function () {
  return Math.min(Math.round((this.raised / this.goal) * 100), 100);
});
campaignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);

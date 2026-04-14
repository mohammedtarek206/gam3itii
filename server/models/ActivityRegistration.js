const mongoose = require('mongoose');

const activityRegistrationSchema = new mongoose.Schema({
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' },
  createdAt: { type: Date, default: Date.now },
});

// Prevent duplicate registrations
activityRegistrationSchema.index({ activity: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ActivityRegistration', activityRegistrationSchema);

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['educational', 'social', 'health', 'sports', 'cultural', 'volunteer', 'other'],
    default: 'other',
  },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  maxParticipants: { type: Number, default: 0 }, // 0 = unlimited
  registeredCount: { type: Number, default: 0 },
  image: { type: String },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', activitySchema);

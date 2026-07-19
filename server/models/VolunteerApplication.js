const mongoose = require('mongoose');

const volunteerApplicationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  fullName: { type: String, required: true },
  nationalId: { type: String }, // Optional
  email: { type: String, required: true },
  phone: { type: String, required: true },
  governorate: { type: String, required: true },
  city: { type: String, required: true },
  age: { type: Number, required: true },
  education: { type: String, required: true },
  profession: { type: String },
  skills: { type: String },
  motivation: { type: String, required: true },
  availableDays: [{ type: String }], // ['saturday','sunday', ...]
  cvFile: { type: String }, // Optional file path/URL
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected'],
    default: 'pending'
  },
  adminNote: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VolunteerApplication', volunteerApplicationSchema);

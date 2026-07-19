const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['current', 'past'], default: 'current' },
  startDate: { type: Date },
  endDate: { type: Date },
  images: [{ type: String }], // Google Drive or other URLs (converted)
  mainImage: { type: String }, // Primary display image
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'suspended'],
    default: 'active'
  },
  location: { type: String },
  beneficiaries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Project', projectSchema);

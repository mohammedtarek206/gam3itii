const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    ar: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true }
  },
  description: {
    ar: { type: String, required: true },
    en: { type: String, required: true }
  },
  type: { type: String, enum: ['current', 'past'], default: 'current' },
  startDate: { type: Date },
  endDate: { type: Date },
  mainImage: { type: String }, // Primary display image
  images: [{ type: String }], // Gallery
  pdfLinks: [{ type: String }],
  videoLink: { type: String },
  isHidden: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'suspended'],
    default: 'active'
  },
  location: { type: String },
  beneficiaries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Project', projectSchema);

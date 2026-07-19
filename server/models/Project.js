const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    ar: { type: String, trim: true, default: '' },
    en: { type: String, trim: true, default: '' }
  },
  description: {
    ar: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  type: { type: String, enum: ['current', 'past'], default: 'current' },
  startDate: { type: Date },
  endDate: { type: Date },
  mainImage: { type: String, default: '' },
  images: [{ type: String }],
  pdfLinks: [{ type: String }],
  videoLink: { type: String, default: '' },
  isHidden: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'suspended'],
    default: 'active'
  },
  location: { type: String, default: '' },
  beneficiaries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Project', projectSchema);

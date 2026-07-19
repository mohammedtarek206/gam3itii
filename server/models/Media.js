const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  driveId: { type: String }, // To uniquely identify Google Drive files
  type: { type: String, enum: ['image', 'video', 'pdf', 'document'], default: 'image' },
  folder: { type: String, default: 'general' }, // Category/Folder for organization
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Media', mediaSchema);

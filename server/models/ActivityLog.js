const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
  entity: { type: String, required: true }, // e.g., 'Project', 'User', 'News', 'Auth'
  entityId: { type: mongoose.Schema.Types.ObjectId }, // ID of the affected document (optional)
  details: { type: String }, // E.g., "Updated project title to XYZ"
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);

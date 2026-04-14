const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['fulltime', 'parttime', 'volunteer', 'remote'], default: 'fulltime' },
  requirements: [{ type: String }],
  tasks: [{ type: String }],
  salary: { type: String },
  deadline: { type: Date },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  applicantCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);

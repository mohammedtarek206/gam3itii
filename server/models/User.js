const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { 
    type: String, 
    enum: ['user', 'superadmin', 'admin', 'editor', 'volunteer_manager', 'hr_manager', 'content_manager'], 
    default: 'user' 
  },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  totalDonated: { type: Number, default: 0 },
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return await bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);

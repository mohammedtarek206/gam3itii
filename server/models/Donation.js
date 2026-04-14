const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  donorName: { type: String, default: 'متبرع مجهول' },
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ['vodafone_cash', 'bank_card', 'instapay', 'other'],
    default: 'other',
  },
  recurring: { type: String, enum: ['none', 'weekly', 'monthly'], default: 'none' },
  anonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Donation', donationSchema);

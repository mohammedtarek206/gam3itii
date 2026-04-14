const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Safe dotenv loading
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Improved Connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

connectDB();

// Health check root
app.get('/', (req, res) => res.json({ success: true, message: 'Jam3iyati API is working! (Root Mode)' }));

// Routes
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/cases', require('./routes/cases'));
  app.use('/api/campaigns', require('./routes/campaigns'));
  app.use('/api/donations', require('./routes/donations'));
  app.use('/api/jobs', require('./routes/jobs'));
  app.use('/api/applications', require('./routes/applications'));
  app.use('/api/notifications', require('./routes/notifications'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/stats', require('./routes/stats'));
  app.use('/api/activities', require('./routes/activities'));
} catch (error) {
  console.error("❌ Route Loading Error:", error.message);
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'خطأ في الخادم' });
});

module.exports = app;

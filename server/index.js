const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// Permissive CORS for SPA
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://gameia-wine.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

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

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Jam3iyati API is working!',
    env: process.env.NODE_ENV,
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Helper to handle both /api and root routes if needed
const apiRouter = express.Router();
apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/cases', require('./routes/cases'));
apiRouter.use('/campaigns', require('./routes/campaigns'));
apiRouter.use('/donations', require('./routes/donations'));
apiRouter.use('/jobs', require('./routes/jobs'));
apiRouter.use('/applications', require('./routes/applications'));
apiRouter.use('/notifications', require('./routes/notifications'));
apiRouter.use('/admin', require('./routes/admin'));
apiRouter.use('/stats', require('./routes/stats'));
apiRouter.use('/activities', require('./routes/activities'));

app.use('/api', apiRouter);

// Fallback for direct /auth etc if someone hits it
app.use(apiRouter);

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ success: false, message: 'خطأ في الخادم' });
});

app.use(helmet());

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}


module.exports = app;

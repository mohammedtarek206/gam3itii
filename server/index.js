const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();

// Security first
app.use(helmet());

// Load Environment Variables
if (process.env.NODE_ENV !== 'production' || !process.env.MONGODB_URI) {
  const envPath = path.join(__dirname, '.env.local');
  const envExists = fs.existsSync(envPath);
  
  require('dotenv').config({
    path: envExists ? envPath : path.join(__dirname, '.env')
  });
}

// Permissive CORS for SPA
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'https://gameia-wine.vercel.app',
  'https://binaa-gray.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Check if origin is in list OR it's a Vercel subdomain
    const isVercel = origin && (origin.endsWith('.vercel.app') || origin.includes('vercel.app'));
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || isVercel || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
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
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is missing');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};
connectDB();

app.get('/api/health', async (req, res) => {
  let connectionError = null;
  try {
    if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    }
  } catch (err) {
    connectionError = err.message;
  }
  
  res.json({ 
    success: true, 
    message: 'API is alive!',
    env: process.env.NODE_ENV,
    mongoURI_Exists: !!process.env.MONGODB_URI,
    dbStatus: mongoose.connection.readyState,
    connectionError
  });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Benna API Root' });
});

// Temporary route to seed the admin user on Vercel
app.get('/api/seed-db', async (req, res) => {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ email: 'mohammed@benna.eg' });
    if (adminExists) {
      return res.json({ success: true, message: '✅ الحساب الحقيقي موجود مسبقاً! يمكنك تسجيل الدخول.' });
    }
    
    await User.create({
      name: 'محمد طارق',
      email: 'mohammed@benna.eg',
      password: 'Binaa@password',
      role: 'admin',
      points: 1000,
      badges: ['مدير المنصة']
    });
    
    res.json({ success: true, message: '✅ تم زرع الحساب الحقيقي بنجاح! يمكنك العودة وتسجيل الدخول الآن.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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
app.use(apiRouter); // Fallback

// Global Error Handler - Improved Logging
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  if (err.stack) console.error(err.stack);
  
  const response = {
    success: false,
    message: err.message || 'خطأ في الخادم',
    debug: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  res.status(500).json(response);
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;

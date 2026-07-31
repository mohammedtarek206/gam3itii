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

app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins dynamically to prevent CORS errors across deployments
    callback(null, origin || true);
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

    // Seed Super Admin if none exists
    const User = require('./models/User');
    const adminEmail = 'super@benaa.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      await User.create({ name: 'Super Admin', email: adminEmail, password: 'super123456', role: 'superadmin', isActive: true });
      console.log(`✅ Super Admin created -> Email: ${adminEmail} | Password: super123456`);
    } else {
      adminUser.role = 'superadmin';
      adminUser.password = 'super123456';
      await adminUser.save();
      console.log(`✅ Super Admin ready/reset -> Email: ${adminEmail} | Password: super123456`);
    }

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
  res.json({ success: true, message: 'Benaa For All API Root' });
});

// Temporary route to seed the admin user on Vercel
app.get('/api/seed-db', async (req, res) => {
  try {
    const User = require('./models/User');

    // Seed/Reset mohammed@benaa.eg
    let mohammedAdmin = await User.findOne({ email: 'mohammed@benaa.eg' });
    if (mohammedAdmin) {
      mohammedAdmin.password = 'Binaa@password';
      await mohammedAdmin.save();
    } else {
      await User.create({
        name: 'محمد طارق',
        email: 'mohammed@benaa.eg',
        password: 'Binaa@password',
        role: 'admin',
        points: 1000,
        badges: ['مدير المنصة']
      });
    }

    // Seed/Reset admin@benaa.eg
    let systemAdmin = await User.findOne({ email: 'admin@benaa.eg' });
    if (systemAdmin) {
      systemAdmin.password = 'Admin@123';
      await systemAdmin.save();
    } else {
      await User.create({
        name: 'مدير النظام',
        email: 'admin@benaa.eg',
        password: 'Admin@123',
        role: 'admin',
        points: 9999,
        badges: ['سفير الخير', 'فاعل خير']
      });
    }

    res.json({ success: true, message: '✅ تم تهيئة حسابات المسؤولين (Admins) بنجاح على قاعدة البيانات!' });
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
apiRouter.use('/projects', require('./routes/projects'));
apiRouter.use('/volunteers', require('./routes/volunteers'));
apiRouter.use('/assessments', require('./routes/assessments'));
apiRouter.use('/media', require('./routes/media'));
apiRouter.use('/activity-logs', require('./routes/activityLogs'));

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

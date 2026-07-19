const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'غير مصرح لك' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    
    // Check if account is active
    if (req.user.isActive === false) {
      return res.status(403).json({ success: false, message: 'تم تعطيل هذا الحساب. يرجى مراجعة الإدارة.' });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'توكن غير صالح' });
  }
};

// RBAC Middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== 'superadmin')) {
      return res.status(403).json({ success: false, message: 'ليس لديك الصلاحية الكافية للقيام بهذا الإجراء' });
    }
    next();
  };
};

// Legacy admin middleware
exports.admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) return next();
  return res.status(403).json({ success: false, message: 'هذا الإجراء مخصص للمشرفين فقط' });
};

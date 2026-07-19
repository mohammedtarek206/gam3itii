const ActivityLog = require('../models/ActivityLog');

exports.logActivity = (entity, action, detailsFunc = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
          let details = '';
          let entityId = null;
          
          if (detailsFunc) {
            details = detailsFunc(req, parsedBody);
          } else {
            details = `تمت العملية بنجاح: ${action} على ${entity}`;
          }
          
          if (parsedBody && parsedBody.data && parsedBody.data._id) {
            entityId = parsedBody.data._id;
          } else if (req.params.id) {
            entityId = req.params.id;
          }

          ActivityLog.create({
            user: req.user._id,
            action,
            entity,
            entityId,
            details,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
          }).catch(err => console.error('Error logging activity:', err));
        } catch (e) {}
      }
      originalSend.call(this, body);
    };
    next();
  };
};

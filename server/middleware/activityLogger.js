const ActivityLog = require('../models/ActivityLog');

/**
 * Simple async function to log an activity - called manually inside route handlers.
 * This avoids the res.send override issues with the middleware approach.
 */
const log = async ({ user, action, entity, entityId = null, details = '', ip = '' }) => {
  try {
    await ActivityLog.create({ user, action, entity, entityId, details, ipAddress: ip });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

/**
 * Express middleware factory - wraps the next handler and logs AFTER success.
 * Simplified to avoid res.send override bugs.
 */
exports.logActivity = (entity, action, detailsFunc = null) => {
  return async (req, res, next) => {
    // Just pass through - actual logging is done inside route handlers via `log()`
    next();
  };
};

exports.log = log;

try {
  module.exports = require('../server/index.js');
} catch (e) {
  module.exports = (req, res) => {
    res.status(500).json({
      error: e.message,
      stack: e.stack
    });
  };
}

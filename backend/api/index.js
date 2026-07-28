let app;
let startupError = null;

try {
  app = require('../src/app');
} catch (error) {
  startupError = error;
}

module.exports = async (req, res) => {
  if (startupError) {
    return res.status(500).json({ 
      error: 'Backend Startup Crash', 
      message: startupError.message, 
      stack: startupError.stack 
    });
  }

  try {
    return await app(req, res);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Backend Runtime Crash', 
      message: error.message, 
      stack: error.stack 
    });
  }
};

const app = require('../src/app');
const { connectDB } = require('../src/config/db');
const { errorHandler } = require('../src/middleware/errorHandler');

module.exports = async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Serverless request failed:', error);
    return errorHandler(error, req, res, () => {});
  }
};

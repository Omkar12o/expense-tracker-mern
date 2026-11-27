const analyticsService = require('../services/analyticsService');
const { sendSuccess } = require('../utils/response');

async function get(req, res, next) {
  try {
    const range = req.valid.query.range || 'month';
    const analytics = await analyticsService.get(req.user._id, range);
    return sendSuccess(res, analytics);
  } catch (error) {
    return next(error);
  }
}

module.exports = { get };

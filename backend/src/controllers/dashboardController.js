const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/response');

async function get(req, res, next) {
  try {
    const dashboard = await dashboardService.get(req.user._id);
    return sendSuccess(res, dashboard);
  } catch (error) {
    return next(error);
  }
}

module.exports = { get };

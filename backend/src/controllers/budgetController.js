const budgetService = require('../services/budgetService');
const { sendSuccess } = require('../utils/response');
const { todayUTC } = require('../utils/dates');

async function list(req, res, next) {
  try {
    const month = req.valid.query.month || todayUTC().slice(0, 7);
    const result = await budgetService.summary(req.user._id, month);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

async function set(req, res, next) {
  try {
    const budget = await budgetService.set(req.user._id, req.valid.body);
    return sendSuccess(res, { budget }, { message: 'Budget saved.' });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const result = await budgetService.remove(req.user._id, req.valid.params.id);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, set, remove };

const recurringService = require('../services/recurringService');
const { sendSuccess } = require('../utils/response');

async function run(_req, res, next) {
  try {
    const created = await recurringService.processDueRecurring();
    return sendSuccess(res, { created }, { message: 'Recurring transactions processed.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { run };

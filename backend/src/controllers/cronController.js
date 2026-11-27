const crypto = require('crypto');
const { env } = require('../config/env');
const recurringService = require('../services/recurringService');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

function tokenMatches(candidate) {
  const expected = Buffer.from(env.CRON_SECRET);
  const actual = Buffer.from(candidate);
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

async function run(req, res, next) {
  try {
    const parts = String(req.headers.authorization || '').trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !tokenMatches(parts[1])) {
      throw AppError.unauthorized('Invalid cron secret.', 'INVALID_TOKEN');
    }

    const created = await recurringService.processDueRecurring();
    return sendSuccess(res, { created }, { message: 'Recurring transactions processed.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { run };

const crypto = require('crypto');
const { env } = require('../config/env');
const AppError = require('../utils/AppError');

function tokenMatches(candidate) {
  const expected = Buffer.from(env.CRON_SECRET);
  const actual = Buffer.from(candidate);
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function protectCron(req, _res, next) {
  const parts = String(req.headers.authorization || '').trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !tokenMatches(parts[1])) {
    return next(AppError.unauthorized('Invalid cron secret.', 'INVALID_TOKEN'));
  }
  return next();
}

module.exports = { protectCron };

const recurringService = require('../services/recurringService');

const lastRun = new Map();
const INTERVAL_MS = 60 * 1000;

function recurringTrigger(req, _res, next) {
  if (!req.user) return next();

  const now = Date.now();
  const previous = lastRun.get(req.user._id.toString()) || 0;
  if (now - previous < INTERVAL_MS) return next();

  lastRun.set(req.user._id.toString(), now);
  recurringService.processDueRecurring(req.user._id).catch((error) => {
    if (process.env.NODE_ENV !== 'test') console.error('Recurring processing failed:', error);
  });
  return next();
}

module.exports = recurringTrigger;

const { todayUTC } = require('../utils/dates');

function withTransactionDefaults(req, _res, next) {
  if (req.body && typeof req.body === 'object' && req.body.date === undefined) {
    req.body.date = todayUTC();
  }
  next();
}

function withAccountDefaults(req, _res, next) {
  if (req.body && typeof req.body === 'object' && req.body.initialBalance === undefined) {
    req.body.initialBalance = 0;
  }
  next();
}

module.exports = { withTransactionDefaults, withAccountDefaults };

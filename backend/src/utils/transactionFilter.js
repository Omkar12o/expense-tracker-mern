const mongoose = require('mongoose');
const { escapeRegex, roundMoney } = require('./text');
const { startOfUTCDay } = require('./dates');

function buildTransactionFilter(userId, query = {}) {
  const filter = { user: userId };

  if (query.type) filter.type = query.type;

  if (query.category) {
    filter.category = new RegExp(`^${escapeRegex(query.category)}$`, 'i');
  }

  if (query.account) {
    filter.account = new mongoose.Types.ObjectId(query.account);
  }

  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = startOfUTCDay(query.from);
    if (query.to) filter.date.$lte = new Date(`${query.to}T23:59:59.999Z`);
  }

  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    filter.amount = {};
    if (query.minAmount !== undefined) filter.amount.$gte = query.minAmount;
    if (query.maxAmount !== undefined) filter.amount.$lte = query.maxAmount;
  }

  if (query.search) {
    const escaped = escapeRegex(query.search.trim());
    const clauses = [
      { note: new RegExp(escaped, 'i') },
      { category: new RegExp(escaped, 'i') },
    ];
    const numeric = Number(query.search);
    if (query.search.trim() !== '' && Number.isFinite(numeric)) {
      clauses.push({ amount: roundMoney(numeric) });
    }
    filter.$or = clauses;
  }

  return filter;
}

module.exports = { buildTransactionFilter };

const Transaction = require('../models/Transaction');
const accountService = require('./accountService');
const budgetService = require('./budgetService');
const transactionService = require('./transactionService');
const analyticsService = require('./analyticsService');
const { todayUTC } = require('../utils/dates');
const { roundMoney } = require('../utils/text');

async function allTimeTotals(userId) {
  const rows = await Transaction.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
        expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
      },
    },
  ]);
  const totals = rows[0] || { income: 0, expense: 0 };
  const income = roundMoney(totals.income);
  const expense = roundMoney(totals.expense);
  return { income, expense, balance: roundMoney(income - expense) };
}

async function get(userId) {
  const month = todayUTC().slice(0, 7);
  const [totals, currentMonth, budget, trend, recent, accounts] = await Promise.all([
    allTimeTotals(userId),
    analyticsService.monthTotals(userId, month),
    budgetService.summary(userId, month),
    analyticsService.monthlyTrend(userId, 6),
    transactionService.list(userId, { page: 1, limit: 8 }),
    accountService.list(userId),
  ]);

  return {
    totals,
    currentMonth,
    budget: budget.overall,
    trend,
    recentTransactions: recent.items,
    accounts: { items: accounts.items, total: accounts.total },
  };
}

module.exports = { get, allTimeTotals };

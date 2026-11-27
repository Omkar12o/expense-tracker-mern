const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');
const categoryService = require('./categoryService');
const { budgetItem } = require('../utils/budget');
const { shiftMonth, startOfMonth } = require('../utils/dates');
const { escapeRegex } = require('../utils/text');

async function monthSpent(userId, month, category = null) {
  const nextMonth = shiftMonth(month, 1);
  const match = {
    user: userId,
    type: 'expense',
    date: {
      $gte: new Date(`${startOfMonth(month)}T00:00:00.000Z`),
      $lt: new Date(`${startOfMonth(nextMonth)}T00:00:00.000Z`),
    },
  };
  if (category) match.category = new RegExp(`^${escapeRegex(category)}$`, 'i');

  const rows = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return rows[0]?.total || 0;
}

async function latestBudgets(userId, month) {
  const budgets = await Budget.find({ user: userId, month: { $lte: month } })
    .sort({ month: -1, updatedAt: -1 })
    .lean();

  const latest = new Map();
  for (const budget of budgets) {
    const key = budget.category ? `category:${budget.category.toLowerCase()}` : 'overall';
    if (!latest.has(key)) latest.set(key, budget);
  }
  return latest;
}

async function summary(userId, month) {
  const budgets = await latestBudgets(userId, month);
  const totalSpent = await monthSpent(userId, month);
  const overallBudget = budgets.get('overall');

  const categories = await Promise.all(
    [...budgets.entries()]
      .filter(([key]) => key.startsWith('category:'))
      .map(async ([, budget]) => budgetItem({
        budget,
        spent: await monthSpent(userId, month, budget.category),
        month,
      })),
  );
  categories.sort((a, b) => a.category.localeCompare(b.category));

  return {
    month,
    totalSpent,
    overall: overallBudget ? budgetItem({ budget: overallBudget, spent: totalSpent, month }) : null,
    categories,
  };
}

async function set(userId, input) {
  const category = input.category
    ? (await categoryService.resolve(userId, 'expense', input.category)).name
    : null;

  const budget = await Budget.findOneAndUpdate(
    { user: userId, month: input.month, category },
    { $set: { user: userId, month: input.month, category, amount: input.amount } },
    { upsert: true, returnDocument: 'after' },
  );

  const spent = await monthSpent(userId, input.month, category);
  return budgetItem({ budget, spent, month: input.month });
}

async function remove(userId, id) {
  const budget = await Budget.findOne({ _id: id, user: userId });
  if (!budget) throw AppError.notFound('Budget not found.', 'BUDGET_NOT_FOUND');
  await budget.deleteOne();
  return { message: 'Budget deleted.' };
}

async function alertsForExpense(userId, dateString, category) {
  const month = dateString.slice(0, 7);
  const current = await summary(userId, month);
  const alerts = [];
  if (current.overall) alerts.push(current.overall);

  const categoryAlert = current.categories.find(
    (item) => item.category.toLowerCase() === category.toLowerCase(),
  );
  if (categoryAlert) alerts.push(categoryAlert);
  return alerts;
}

module.exports = { summary, set, remove, alertsForExpense, monthSpent };

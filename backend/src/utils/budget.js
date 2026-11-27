const { env } = require('../config/env');
const { monthLabel } = require('./dates');
const { roundMoney } = require('./text');

function formatMoney(value) {
  const amount = roundMoney(value);
  return `${env.CURRENCY_SYMBOL}${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)}`;
}

function levelFor(percent) {
  if (percent >= 100) return 'exceeded';
  if (percent >= 90) return 'critical';
  if (percent >= 75) return 'high';
  if (percent >= 50) return 'warning';
  return 'ok';
}

function budgetMessage({ category, month, spent, amount }) {
  const percent = amount > 0 ? (spent / amount) * 100 : spent > 0 ? Infinity : 0;
  const scope = category ? `${category} budget` : 'Budget';

  if (spent > amount) {
    const over = roundMoney(spent - amount);
    return `${scope} exceeded by ${formatMoney(over)}.`;
  }

  const displayPercent = Math.floor(percent);
  const period = category ? `${category} budget` : `${monthLabel(month)} budget`;
  return `You have used ${displayPercent}% of your ${period}.`;
}

function budgetItem({ budget, spent, month }) {
  const amount = roundMoney(budget.amount);
  const totalSpent = roundMoney(spent);
  const percentRaw = amount > 0 ? (totalSpent / amount) * 100 : totalSpent > 0 ? Infinity : 0;
  const level = levelFor(percentRaw);
  const category = budget.category || null;

  return {
    id: budget._id ? budget._id.toString() : budget.id,
    month: budget.month,
    sourceMonth: budget.month,
    inherited: budget.month !== month,
    category,
    amount,
    spent: totalSpent,
    remaining: roundMoney(amount - totalSpent),
    percentUsed: Number.isFinite(percentRaw) ? roundMoney(percentRaw) : 100000,
    level,
    message: budgetMessage({ category, month, spent: totalSpent, amount }),
  };
}

module.exports = { budgetItem, budgetMessage, formatMoney, levelFor };

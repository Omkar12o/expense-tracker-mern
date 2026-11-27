const Transaction = require('../models/Transaction');
const categoryService = require('./categoryService');
const { todayUTC, shiftUTC, shiftMonth, startOfMonth } = require('../utils/dates');
const { roundMoney } = require('../utils/text');

function rangeBounds(range) {
  const end = todayUTC();
  const currentMonth = end.slice(0, 7);
  if (range === 'week') return { unit: 'day', start: shiftUTC(end, -6), end };
  if (range === 'month') return { unit: 'day', start: shiftUTC(end, -29), end };
  if (range === '3months') {
    return { unit: 'month', start: startOfMonth(shiftMonth(currentMonth, -2)), end };
  }
  return { unit: 'month', start: startOfMonth(shiftMonth(currentMonth, -11)), end };
}

function buckets({ unit, start, end }) {
  const keys = [];
  if (unit === 'day') {
    const last = new Date(`${end}T00:00:00.000Z`).getTime();
    for (
      let current = new Date(`${start}T00:00:00.000Z`).getTime();
      current <= last;
      current += 86400000
    ) {
      keys.push(new Date(current).toISOString().slice(0, 10));
    }
  } else {
    const from = start.slice(0, 7);
    const to = end.slice(0, 7);
    let cursor = from;
    while (cursor <= to && keys.length < 24) {
      keys.push(cursor);
      cursor = shiftMonth(cursor, 1);
    }
  }
  return keys;
}

async function totalsByKey(userId, bounds) {
  const format = bounds.unit === 'day' ? '%Y-%m-%d' : '%Y-%m';
  const rows = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: {
          $gte: new Date(`${bounds.start}T00:00:00.000Z`),
          $lte: new Date(`${bounds.end}T23:59:59.999Z`),
        },
      },
    },
    {
      $group: {
        _id: {
          key: { $dateToString: { format, date: '$date', timezone: 'UTC' } },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const map = new Map();
  for (const row of rows) {
    if (!map.has(row._id.key)) map.set(row._id.key, { income: 0, expense: 0 });
    map.get(row._id.key)[row._id.type] = roundMoney(row.total);
  }
  return map;
}

async function categoryTotals(userId, bounds, type) {
  const rows = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type,
        date: {
          $gte: new Date(`${bounds.start}T00:00:00.000Z`),
          $lte: new Date(`${bounds.end}T23:59:59.999Z`),
        },
      },
    },
    { $group: { _id: '$category', amount: { $sum: '$amount' } } },
    { $sort: { amount: -1 } },
  ]);
  return rows.map((row) => ({ category: row._id, amount: roundMoney(row.amount) }));
}

async function monthTotals(userId, month) {
  const nextMonth = shiftMonth(month, 1);
  const rows = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: {
          $gte: new Date(`${startOfMonth(month)}T00:00:00.000Z`),
          $lt: new Date(`${startOfMonth(nextMonth)}T00:00:00.000Z`),
        },
      },
    },
    {
      $group: {
        _id: null,
        income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
        expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
      },
    },
  ]);
  const totals = rows[0] || { income: 0, expense: 0 };
  return {
    month,
    income: roundMoney(totals.income),
    expense: roundMoney(totals.expense),
    net: roundMoney(totals.income - totals.expense),
  };
}

function withPercent(items, total) {
  return items.map((item) => ({
    ...item,
    percent: total > 0 ? roundMoney((item.amount / total) * 100) : 0,
  }));
}

async function get(userId, range = 'month') {
  const bounds = rangeBounds(range);
  const [keyTotals, expenseCategories, incomeCategories, currentMonth, icons] = await Promise.all([
    totalsByKey(userId, bounds),
    categoryTotals(userId, bounds, 'expense'),
    categoryTotals(userId, bounds, 'income'),
    monthTotals(userId, bounds.end.slice(0, 7)),
    categoryService.iconMap(userId),
  ]);

  const trend = buckets(bounds).map((key) => {
    const values = keyTotals.get(key) || { income: 0, expense: 0 };
    return { key, income: values.income, expense: values.expense };
  });
  const income = roundMoney(trend.reduce((sum, item) => sum + item.income, 0));
  const expense = roundMoney(trend.reduce((sum, item) => sum + item.expense, 0));
  const net = roundMoney(income - expense);

  const decorate = (items, type) =>
    withPercent(items, type === 'expense' ? expense : income).map((item) => ({
      ...item,
      icon: icons.get(`${type}:${item.category.toLowerCase()}`) || '',
    }));

  return {
    range,
    unit: bounds.unit,
    start: bounds.start,
    end: bounds.end,
    summary: {
      income,
      expense,
      net,
      savingsRate: income > 0 ? roundMoney((net / income) * 100) : 0,
    },
    trend,
    expenseByCategory: decorate(expenseCategories, 'expense'),
    incomeByCategory: decorate(incomeCategories, 'income'),
    currentMonth,
  };
}

async function monthlyTrend(userId, months = 6) {
  const currentMonth = todayUTC().slice(0, 7);
  const keys = [];
  let cursor = shiftMonth(currentMonth, -(months - 1));
  while (keys.length < months) {
    keys.push(cursor);
    cursor = shiftMonth(cursor, 1);
  }
  const rows = await Promise.all(keys.map((month) => monthTotals(userId, month)));
  return rows.map(({ month, income, expense }) => ({ key: month, income, expense }));
}

module.exports = { get, rangeBounds, monthTotals, monthlyTrend };

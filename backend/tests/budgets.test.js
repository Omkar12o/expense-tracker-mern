const request = require('supertest');
const app = require('../src/app');
const { env } = require('../src/config/env');
const { todayUTC, monthKey, monthLabel, shiftMonth } = require('../src/utils/dates');
const { register, authHeader, defaultAccounts, createTransaction } = require('./helpers/authHelper');

const month = monthKey(todayUTC());
const label = monthLabel(month);

async function setup() {
  const created = await register(app);
  const [cash] = await defaultAccounts(app, created.token);
  const headers = authHeader(created.token);
  return { ...created, cash, headers };
}

async function setBudget(headers, amount, category = null, targetMonth = month) {
  return request(app).put('/api/budgets').set(headers).send({ month: targetMonth, category, amount });
}

async function expense(token, cash, amount, category = 'Food') {
  return createTransaction(app, token, { type: 'expense', amount, category, account: cash.id });
}

describe('Budgets', () => {
  it('uses exact levels and messages at every threshold', async () => {
    const { token, cash, headers } = await setup();
    await setBudget(headers, 100);

    const expectations = [
      [49, 'ok', `You have used 49% of your ${label} budget.`],
      [1, 'warning', `You have used 50% of your ${label} budget.`],
      [25, 'high', `You have used 75% of your ${label} budget.`],
      [15, 'critical', `You have used 90% of your ${label} budget.`],
      [10, 'exceeded', `You have used 100% of your ${label} budget.`],
      [25, 'exceeded', `Budget exceeded by ${env.CURRENCY_SYMBOL}25.`],
    ];

    for (const [amount, level, message] of expectations) {
      const created = await expense(token, cash, amount);
      expect(created.status).toBe(201);
      const res = await request(app).get(`/api/budgets?month=${month}`).set(headers);
      expect(res.body.data.overall.level).toBe(level);
      expect(res.body.data.overall.message).toBe(message);
    }
  });

  it('does not round 89.9% up to 90%', async () => {
    const { token, cash, headers } = await setup();
    await setBudget(headers, 1000);
    await expense(token, cash, 899);

    const res = await request(app).get('/api/budgets').set(headers);
    expect(res.body.data.overall.percentUsed).toBe(89.9);
    expect(res.body.data.overall.level).toBe('high');
    expect(res.body.data.overall.message).toBe(`You have used 89% of your ${label} budget.`);
  });

  it('carries budgets forward and keeps category budgets independent', async () => {
    const { token, cash, headers } = await setup();
    const previous = shiftMonth(month, -1);
    await setBudget(headers, 1000, null, previous);
    await setBudget(headers, 100, 'food', previous);

    const carried = await request(app).get(`/api/budgets?month=${month}`).set(headers);
    expect(carried.body.data.overall.inherited).toBe(true);
    expect(carried.body.data.overall.sourceMonth).toBe(previous);
    expect(carried.body.data.categories[0].category).toBe('Food');
    expect(carried.body.data.categories[0].inherited).toBe(true);

    const alerted = await expense(token, cash, 60, 'food');
    expect(alerted.body.data.budgetAlerts).toHaveLength(2);
    expect(alerted.body.data.budgetAlerts[1].message).toBe('You have used 60% of your Food budget.');
    await expense(token, cash, 60, 'Travel');

    const current = await request(app).get('/api/budgets').set(headers);
    const food = current.body.data.categories.find((item) => item.category === 'Food');
    expect(food.spent).toBe(60);
    expect(food.percentUsed).toBe(60);
    expect(current.body.data.overall.spent).toBe(120);
    expect(current.body.data.overall.percentUsed).toBe(12);
  });
});

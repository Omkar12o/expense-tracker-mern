const request = require('supertest');
const app = require('../src/app');
const { todayUTC, monthKey } = require('../src/utils/dates');
const { register, authHeader, defaultAccounts, createTransaction } = require('./helpers/authHelper');

describe('Dashboard', () => {
  it('returns totals, budget state, trend, recent transactions and accounts', async () => {
    const created = await register(app);
    const headers = authHeader(created.token);
    const [cash] = await defaultAccounts(app, created.token);
    const month = monthKey(todayUTC());

    await request(app)
      .put('/api/budgets')
      .set(headers)
      .send({ month, category: null, amount: 100 });
    await createTransaction(app, created.token, {
      type: 'income',
      amount: 500,
      category: 'Salary',
      account: cash.id,
    });
    await createTransaction(app, created.token, {
      type: 'expense',
      amount: 40,
      category: 'Food',
      account: cash.id,
    });

    const res = await request(app).get('/api/dashboard').set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data.totals).toEqual({ income: 500, expense: 40, balance: 460 });
    expect(res.body.data.currentMonth.net).toBe(460);
    expect(res.body.data.budget).toMatchObject({ spent: 40, remaining: 60, percentUsed: 40, level: 'ok' });
    expect(res.body.data.trend).toHaveLength(6);
    expect(res.body.data.recentTransactions).toHaveLength(2);
    expect(res.body.data.recentTransactions[0].categoryIcon).toBe('🍔');
    expect(res.body.data.accounts.items).toHaveLength(2);
    expect(res.body.data.accounts.total).toBe(460);
  });
});

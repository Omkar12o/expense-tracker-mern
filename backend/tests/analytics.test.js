const request = require('supertest');
const app = require('../src/app');
const { todayUTC, shiftUTC } = require('../src/utils/dates');
const { register, authHeader, defaultAccounts, createTransaction } = require('./helpers/authHelper');

describe('Analytics', () => {
  it('computes every range from stored transactions with zero-filled buckets', async () => {
    const created = await register(app);
    const headers = authHeader(created.token);
    const [cash] = await defaultAccounts(app, created.token);
    const today = todayUTC();

    await createTransaction(app, created.token, {
      type: 'expense',
      amount: 10,
      category: 'Food',
      account: cash.id,
      date: today,
    });
    await createTransaction(app, created.token, {
      type: 'income',
      amount: 100,
      category: 'Salary',
      account: cash.id,
      date: shiftUTC(today, -3),
    });
    await createTransaction(app, created.token, {
      type: 'expense',
      amount: 20,
      category: 'Travel',
      account: cash.id,
      date: shiftUTC(today, -10),
    });
    await createTransaction(app, created.token, {
      type: 'expense',
      amount: 30,
      category: 'Bills',
      account: cash.id,
      date: shiftUTC(today, -40),
    });
    await createTransaction(app, created.token, {
      type: 'income',
      amount: 500,
      category: 'Business',
      account: cash.id,
      date: shiftUTC(today, -200),
    });

    const week = await request(app).get('/api/analytics?range=week').set(headers);
    expect(week.status).toBe(200);
    expect(week.body.data.unit).toBe('day');
    expect(week.body.data.trend).toHaveLength(7);
    expect(week.body.data.summary).toMatchObject({ income: 100, expense: 10, net: 90, savingsRate: 90 });
    expect(week.body.data.trend.some((bucket) => bucket.income === 0 && bucket.expense === 0)).toBe(true);
    expect(week.body.data.expenseByCategory[0]).toMatchObject({ category: 'Food', amount: 10, percent: 100 });
    expect(week.body.data.currentMonth.month).toBe(today.slice(0, 7));

    const month = await request(app).get('/api/analytics?range=month').set(headers);
    expect(month.body.data.trend).toHaveLength(30);
    expect(month.body.data.summary).toMatchObject({ income: 100, expense: 30, net: 70 });

    const threeMonths = await request(app).get('/api/analytics?range=3months').set(headers);
    expect(threeMonths.body.data.unit).toBe('month');
    expect(threeMonths.body.data.trend).toHaveLength(3);
    expect(threeMonths.body.data.summary).toMatchObject({ income: 100, expense: 60, net: 40 });

    const year = await request(app).get('/api/analytics?range=year').set(headers);
    expect(year.body.data.trend).toHaveLength(12);
    expect(year.body.data.summary).toMatchObject({ income: 600, expense: 60, net: 540 });

    const empty = await request(app).get('/api/analytics?range=week').set(authHeader((await register(app)).token));
    expect(empty.body.data.summary).toMatchObject({ income: 0, expense: 0, net: 0, savingsRate: 0 });
    expect(empty.body.data.trend).toHaveLength(7);
  });
});

const request = require('supertest');
const app = require('../src/app');
const { env } = require('../src/config/env');
const { shiftUTC } = require('../src/utils/dates');
const { register, authHeader, defaultAccounts, createTransaction } = require('./helpers/authHelper');

async function copies(token, sourceId) {
  const res = await request(app).get('/api/transactions?limit=100').set(authHeader(token));
  return res.body.data.filter((item) => item.recurringSource === sourceId);
}

function cron(secret = env.CRON_SECRET) {
  return request(app).get('/api/cron/recurring').set('Authorization', `Bearer ${secret}`);
}

describe('Recurring transactions', () => {
  it('catches up weekly occurrences once and is idempotent', async () => {
    const created = await register(app);
    const [cash] = await defaultAccounts(app, created.token);
    const template = await createTransaction(app, created.token, {
      type: 'expense',
      amount: 10,
      category: 'Subscription',
      account: cash.id,
      date: shiftUTC(new Date().toISOString().slice(0, 10), -21),
      isRecurring: true,
      recurrence: { frequency: 'weekly' },
    });
    const templateId = template.body.data.transaction.id;

    const first = await cron();
    expect(first.status).toBe(200);
    expect(first.body.data.created).toBe(3);
    expect(await copies(created.token, templateId)).toHaveLength(3);

    const second = await cron();
    expect(second.body.data.created).toBe(0);
    expect(await copies(created.token, templateId)).toHaveLength(3);
  });

  it('keeps the month-end anchor and honours endDate', async () => {
    const created = await register(app);
    const [cash] = await defaultAccounts(app, created.token);
    const template = await createTransaction(app, created.token, {
      type: 'expense',
      amount: 25,
      category: 'Rent',
      account: cash.id,
      date: '2026-01-31',
      isRecurring: true,
      recurrence: { frequency: 'monthly', anchorDay: 31, endDate: '2026-03-31' },
    });
    const templateId = template.body.data.transaction.id;

    const result = await cron();
    expect(result.status).toBe(200);
    const generated = await copies(created.token, templateId);
    expect(generated.map((item) => item.date).sort()).toEqual(['2026-02-28', '2026-03-31']);

    const again = await cron();
    expect(again.body.data.created).toBe(0);
  });

  it('rejects a wrong cron secret', async () => {
    const res = await cron('definitely-not-the-cron-secret');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});

const request = require('supertest');
const app = require('../src/app');
const { todayUTC } = require('../src/utils/dates');
const { register, authHeader, defaultAccounts, createTransaction } = require('./helpers/authHelper');

async function seedUser() {
  const created = await register(app);
  const [cash] = await defaultAccounts(app, created.token);
  return { ...created, cash };
}

describe('Transactions API', () => {
  it('creates with UTC date defaults, canonical category, rounded amount and sanitised note', async () => {
    const { token, cash } = await seedUser();
    const res = await createTransaction(app, token, {
      type: 'expense',
      amount: 12.345,
      category: 'food',
      account: cash.id,
      note: '<b>Lunch</b>',
      user: '000000000000000000000000',
    });
    const transaction = res.body.data.transaction;

    expect(res.status).toBe(201);
    expect(transaction.date).toBe(todayUTC());
    expect(transaction.category).toBe('Food');
    expect(transaction.amount).toBe(12.35);
    expect(transaction.note).toBe('Lunch');
    expect(transaction.isRecurring).toBe(false);
    expect(transaction.user).toBeUndefined();
  });

  it('reads, updates and deletes only the caller-owned transaction', async () => {
    const { token, cash } = await seedUser();
    const created = await createTransaction(app, token, {
      type: 'expense',
      amount: 20,
      category: 'Travel',
      account: cash.id,
      note: 'Taxi',
    });
    const id = created.body.data.transaction.id;

    const detail = await request(app).get(`/api/transactions/${id}`).set(authHeader(token));
    expect(detail.status).toBe(200);
    expect(detail.body.data.transaction.categoryIcon).toBe('✈️');

    const patched = await request(app)
      .patch(`/api/transactions/${id}`)
      .set(authHeader(token))
      .send({ amount: 21.5, category: 'food', note: '<i>Taxi ride</i>' });
    expect(patched.status).toBe(200);
    expect(patched.body.data.transaction.amount).toBe(21.5);
    expect(patched.body.data.transaction.category).toBe('Food');
    expect(patched.body.data.transaction.note).toBe('Taxi ride');

    const removed = await request(app).delete(`/api/transactions/${id}`).set(authHeader(token));
    expect(removed.status).toBe(204);

    const missing = await request(app).get(`/api/transactions/${id}`).set(authHeader(token));
    expect(missing.status).toBe(404);
  });

  it('rejects invalid writes and invalid query strings', async () => {
    const { token, cash } = await seedUser();
    const valid = { type: 'expense', amount: 10, category: 'Food', account: cash.id };

    const cases = [
      { ...valid, amount: 0 },
      { ...valid, type: 'transfer' },
      { ...valid, category: 'Not A Category' },
      { ...valid, date: '2026-13-40' },
      { ...valid, attachment: 'ftp://example.com/a.png' },
      { ...valid, note: 'x'.repeat(201) },
    ];

    for (const payload of cases) {
      const res = await createTransaction(app, token, payload);
      expect(res.status).toBe(400);
      expect(['VALIDATION_ERROR', 'INVALID_CATEGORY']).toContain(res.body.error.code);
    }

    const badFrom = await request(app)
      .get('/api/transactions?from=2026-02-01&to=2026-01-01')
      .set(authHeader(token));
    expect(badFrom.status).toBe(400);

    const badRange = await request(app)
      .get('/api/transactions?minAmount=20&maxAmount=10')
      .set(authHeader(token));
    expect(badRange.status).toBe(400);

    const bigLimit = await request(app).get('/api/transactions?limit=101').set(authHeader(token));
    expect(bigLimit.status).toBe(400);

    const badId = await request(app).get('/api/transactions/nope').set(authHeader(token));
    expect(badId.status).toBe(400);
  });

  it('paginates, filters, searches and summarises the whole filtered set', async () => {
    const { token, cash } = await seedUser();
    const bankRes = await request(app)
      .post('/api/accounts')
      .set(authHeader(token))
      .send({ name: 'Travel Bank', type: 'Bank Account' });
    const bank = bankRes.body.data.account;

    for (let day = 1; day <= 12; day += 1) {
      const type = day % 3 === 0 ? 'income' : 'expense';
      await createTransaction(app, token, {
        type,
        amount: day,
        category: type === 'income' ? 'Salary' : 'Food',
        account: cash.id,
        date: `2026-01-${String(day).padStart(2, '0')}`,
        note: `note-${day}`,
      });
    }
    await createTransaction(app, token, {
      type: 'expense',
      amount: 50,
      category: 'Travel',
      account: bank.id,
      date: '2026-02-01',
      note: 'flight [urgent]',
    });
    await createTransaction(app, token, {
      type: 'income',
      amount: 50.25,
      category: 'Freelance',
      account: bank.id,
      date: '2026-02-02',
      note: '100% sure',
    });

    const first = await request(app)
      .get('/api/transactions?page=1&limit=5')
      .set(authHeader(token));
    expect(first.body.pagination).toMatchObject({ page: 1, limit: 5, total: 14, pages: 3 });
    expect(first.body.data).toHaveLength(5);

    const capped = await request(app)
      .get('/api/transactions?limit=500')
      .set(authHeader(token));
    expect(capped.status).toBe(400);

    const combined = await request(app)
      .get('/api/transactions?type=expense&category=food&from=2026-01-01&to=2026-01-31&limit=100')
      .set(authHeader(token));
    expect(combined.body.data).toHaveLength(8);
    expect(combined.body.summary).toEqual({ income: 0, expense: 48, net: -48 });

    const searchNote = await request(app)
      .get('/api/transactions?search=note-3')
      .set(authHeader(token));
    expect(searchNote.body.data).toHaveLength(1);

    const searchCategory = await request(app)
      .get('/api/transactions?search=Freelance')
      .set(authHeader(token));
    expect(searchCategory.body.data).toHaveLength(1);

    const searchAmount = await request(app)
      .get('/api/transactions?search=50.25')
      .set(authHeader(token));
    expect(searchAmount.body.data).toHaveLength(1);
    expect(searchAmount.body.data[0].amount).toBe(50.25);

    const regexLiteral = await request(app).get('/api/transactions?search=%5B').set(authHeader(token));
    expect(regexLiteral.body.data).toHaveLength(1);
    expect(regexLiteral.body.data[0].note).toBe('flight [urgent]');
  });

  it('filters recurring and one-time transactions and rejects invalid values', async () => {
    const { token, cash } = await seedUser();
    await createTransaction(app, token, {
      type: 'expense',
      amount: 10,
      category: 'Subscription',
      account: cash.id,
      date: '2026-01-15',
      isRecurring: true,
      recurrence: { frequency: 'monthly', nextDate: '2030-01-15' },
    });
    await createTransaction(app, token, {
      type: 'expense',
      amount: 20,
      category: 'Food',
      account: cash.id,
      date: '2026-01-16',
    });

    const recurring = await request(app)
      .get('/api/transactions?recurring=true&limit=100')
      .set(authHeader(token));
    expect(recurring.status).toBe(200);
    expect(recurring.body.data).toHaveLength(1);
    expect(recurring.body.data[0].isRecurring).toBe(true);

    const oneTime = await request(app)
      .get('/api/transactions?recurring=false&limit=100')
      .set(authHeader(token));
    expect(oneTime.body.data).toHaveLength(1);
    expect(oneTime.body.data[0].isRecurring).toBe(false);

    const invalid = await request(app)
      .get('/api/transactions?recurring=maybe')
      .set(authHeader(token));
    expect(invalid.status).toBe(400);
  });
});

const request = require('supertest');
const app = require('../src/app');
const { CSV_HEADER } = require('../src/utils/csv');
const { register, authHeader, defaultAccounts, createTransaction } = require('./helpers/authHelper');

describe('CSV export', () => {
  it('streams filtered CSV with exact header, RFC-4180 quoting and formula guard', async () => {
    const user = await register(app);
    const [cash] = await defaultAccounts(app, user.token);

    await createTransaction(app, user.token, {
      type: 'expense',
      amount: 5,
      category: 'Food',
      account: cash.id,
      date: '2026-03-01',
      note: 'hello, "world"',
    });
    await createTransaction(app, user.token, {
      type: 'expense',
      amount: 7.5,
      category: 'Travel',
      account: cash.id,
      date: '2026-03-02',
      note: '=SUM(1+1)',
    });
    await createTransaction(app, user.token, {
      type: 'income',
      amount: 100,
      category: 'Salary',
      account: cash.id,
      date: '2026-03-03',
      note: 'should not appear',
    });

    const other = await register(app);
    const [otherCash] = await defaultAccounts(app, other.token);
    await createTransaction(app, other.token, {
      type: 'expense',
      amount: 999,
      category: 'Food',
      account: otherCash.id,
      note: 'other user secret',
    });

    const res = await request(app)
      .get('/api/transactions/export?type=expense')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment; filename="transactions-');
    const lines = res.text.split('\r\n').filter(Boolean);
    expect(lines[0]).toBe(CSV_HEADER);
    expect(lines[0]).toBe('Date,Type,Category,Account,Amount,Note');
    expect(res.text).toContain('"hello, ""world"""');
    expect(res.text).toContain("'=SUM(1+1)");
    expect(res.text).not.toContain('should not appear');
    expect(res.text).not.toContain('other user secret');
    expect(res.text).not.toContain('Income');
  });
});

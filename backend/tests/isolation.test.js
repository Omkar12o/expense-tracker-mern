const request = require('supertest');
const app = require('../src/app');
const { register, authHeader, defaultAccounts, createTransaction } = require('./helpers/authHelper');

describe('User data isolation', () => {
  async function setup() {
    const a = await register(app, { name: 'User A' });
    const b = await register(app, { name: 'User B' });
    const [aCash] = await defaultAccounts(app, a.token);
    const [bCash] = await defaultAccounts(app, b.token);

    const aTx = await createTransaction(app, a.token, {
      type: 'expense',
      amount: 321,
      category: 'Food',
      account: aCash.id,
      note: 'user-a-secret',
    });
    const bTx = await createTransaction(app, b.token, {
      type: 'income',
      amount: 10,
      category: 'Salary',
      account: bCash.id,
      note: 'user-b-private',
    });

    const category = await request(app)
      .post('/api/categories')
      .set(authHeader(a.token))
      .send({ name: 'A Private', type: 'expense' });

    return {
      a,
      b,
      aCash,
      bCash,
      aTxId: aTx.body.data.transaction.id,
      bTxId: bTx.body.data.transaction.id,
      categoryId: category.body.data.category.id,
    };
  }

  it('hides other users transactions behind 404 and leaves them unchanged', async () => {
    const ctx = await setup();
    const bHeaders = authHeader(ctx.b.token);

    const get = await request(app).get(`/api/transactions/${ctx.aTxId}`).set(bHeaders);
    expect(get.status).toBe(404);

    const patch = await request(app)
      .patch(`/api/transactions/${ctx.aTxId}`)
      .set(bHeaders)
      .send({ amount: 1, note: 'hacked' });
    expect(patch.status).toBe(404);

    const del = await request(app).delete(`/api/transactions/${ctx.aTxId}`).set(bHeaders);
    expect(del.status).toBe(404);

    const stillThere = await request(app)
      .get(`/api/transactions/${ctx.aTxId}`)
      .set(authHeader(ctx.a.token));
    expect(stillThere.status).toBe(200);
    expect(stillThere.body.data.transaction.amount).toBe(321);
    expect(stillThere.body.data.transaction.note).toBe('user-a-secret');
  });

  it('keeps lists and exports scoped to the caller', async () => {
    const ctx = await setup();
    const bHeaders = authHeader(ctx.b.token);

    const list = await request(app).get('/api/transactions?limit=100').set(bHeaders);
    expect(list.status).toBe(200);
    expect(list.body.data.map((item) => item.note)).toEqual(['user-b-private']);
    expect(list.body.summary.income).toBe(10);
    expect(list.body.summary.expense).toBe(0);

    const exported = await request(app).get('/api/transactions/export').set(bHeaders);
    expect(exported.status).toBe(200);
    expect(exported.text).not.toContain('user-a-secret');
    expect(exported.text).toContain('user-b-private');
  });

  it('rejects foreign account and category references with 400', async () => {
    const ctx = await setup();
    const bHeaders = authHeader(ctx.b.token);

    const create = await createTransaction(app, ctx.b.token, {
      type: 'expense',
      amount: 5,
      category: 'Food',
      account: ctx.aCash.id,
    });
    expect(create.status).toBe(400);
    expect(create.body.error.code).toBe('INVALID_ACCOUNT');

    const update = await request(app)
      .patch(`/api/transactions/${ctx.bTxId}`)
      .set(bHeaders)
      .send({ account: ctx.aCash.id });
    expect(update.status).toBe(400);

    const category = await createTransaction(app, ctx.b.token, {
      type: 'expense',
      amount: 5,
      category: 'A Private',
      account: ctx.bCash.id,
    });
    expect(category.status).toBe(400);
    expect(category.body.error.code).toBe('INVALID_CATEGORY');
  });

  it('blocks query injection and malformed ids', async () => {
    const ctx = await setup();
    const bHeaders = authHeader(ctx.b.token);

    const injected = await request(app)
      .get('/api/transactions')
      .query({ 'account[$ne]': ctx.aCash.id })
      .set(bHeaders);
    expect(injected.status).toBe(400);
    expect(injected.body.error.code).toBe('INVALID_QUERY');

    const malformed = await request(app).get('/api/transactions/not-an-id').set(bHeaders);
    expect(malformed.status).toBe(400);

    const deleteAccount = await request(app).delete(`/api/accounts/${ctx.aCash.id}`).set(bHeaders);
    expect(deleteAccount.status).toBe(404);

    const deleteCategory = await request(app)
      .delete(`/api/categories/${ctx.categoryId}`)
      .set(bHeaders);
    expect(deleteCategory.status).toBe(404);
  });
});

const request = require('supertest');
const app = require('../src/app');
const { register, authHeader, defaultAccounts, createTransaction } = require('./helpers/authHelper');

describe('Accounts and categories', () => {
  it('creates, updates and lists accounts with computed balances', async () => {
    const created = await register(app);
    const headers = authHeader(created.token);
    const [cash] = await defaultAccounts(app, created.token);

    const accountRes = await request(app)
      .post('/api/accounts')
      .set(headers)
      .send({ name: 'Savings One', type: 'Savings', initialBalance: 100 });
    expect(accountRes.status).toBe(201);
    const account = accountRes.body.data.account;

    await createTransaction(app, created.token, {
      type: 'income',
      amount: 50,
      category: 'Salary',
      account: account.id,
    });
    await createTransaction(app, created.token, {
      type: 'expense',
      amount: 20,
      category: 'Food',
      account: account.id,
    });

    const listed = await request(app).get('/api/accounts').set(headers);
    const savings = listed.body.data.find((item) => item.id === account.id);
    expect(savings.balance).toBe(130);
    expect(listed.body.total).toBe(130);

    const duplicate = await request(app)
      .post('/api/accounts')
      .set(headers)
      .send({ name: 'savings one', type: 'Cash' });
    expect(duplicate.status).toBe(409);

    const patched = await request(app)
      .patch(`/api/accounts/${account.id}`)
      .set(headers)
      .send({ name: 'Savings Two', initialBalance: 200 });
    expect(patched.status).toBe(200);
    expect(patched.body.data.account.name).toBe('Savings Two');
    expect(patched.body.data.account.balance).toBe(230);

    const blocked = await request(app).delete(`/api/accounts/${account.id}`).set(headers);
    expect(blocked.status).toBe(409);
    expect(blocked.body.error.code).toBe('ACCOUNT_IN_USE');

    const unused = await request(app).delete(`/api/accounts/${cash.id}`).set(headers);
    expect(unused.status).toBe(200);
  });

  it('creates custom categories, blocks built-in collisions and deletion when used', async () => {
    const created = await register(app);
    const headers = authHeader(created.token);
    const [cash] = await defaultAccounts(app, created.token);

    const categoryRes = await request(app)
      .post('/api/categories')
      .set(headers)
      .send({ name: 'Pet Care', type: 'expense', icon: '🐶' });
    expect(categoryRes.status).toBe(201);
    const category = categoryRes.body.data.category;

    const duplicate = await request(app)
      .post('/api/categories')
      .set(headers)
      .send({ name: 'pet care', type: 'expense' });
    expect(duplicate.status).toBe(409);

    const builtInCollision = await request(app)
      .post('/api/categories')
      .set(headers)
      .send({ name: 'food', type: 'expense' });
    expect(builtInCollision.status).toBe(409);

    const list = await request(app).get('/api/categories').set(headers);
    const expense = list.body.data.expense;
    expect(expense.some((item) => item.name === 'Pet Care' && item.custom)).toBe(true);
    expect(expense.some((item) => item.name === 'Food' && item.builtIn)).toBe(true);

    await createTransaction(app, created.token, {
      type: 'expense',
      amount: 30,
      category: 'pet care',
      account: cash.id,
    });

    const blocked = await request(app).delete(`/api/categories/${category.id}`).set(headers);
    expect(blocked.status).toBe(409);

    const unusedRes = await request(app)
      .post('/api/categories')
      .set(headers)
      .send({ name: 'Hobbies', type: 'income' });
    const unused = await request(app)
      .delete(`/api/categories/${unusedRes.body.data.category.id}`)
      .set(headers);
    expect(unused.status).toBe(200);
  });
});

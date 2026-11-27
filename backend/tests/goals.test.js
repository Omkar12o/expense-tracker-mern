const request = require('supertest');
const app = require('../src/app');
const { register, authHeader } = require('./helpers/authHelper');

describe('Goals', () => {
  async function setup() {
    const created = await register(app);
    return { ...created, headers: authHeader(created.token) };
  }

  it('creates, contributes, withdraws and deletes goals', async () => {
    const { token, headers } = await setup();
    const created = await request(app)
      .post('/api/goals')
      .set(headers)
      .send({ name: 'New Laptop', targetAmount: 1500, targetDate: '2026-12-31' });
    expect(created.status).toBe(201);
    expect(created.body.data.goal.progress).toBe(0);
    expect(created.body.data.goal.completed).toBe(false);

    const id = created.body.data.goal.id;
    const added = await request(app)
      .post(`/api/goals/${id}/contribute`)
      .set(headers)
      .send({ amount: 850 });
    expect(added.status).toBe(200);
    expect(added.body.data.goal.currentAmount).toBe(850);
    expect(added.body.data.goal.progress).toBe(56);

    const guarded = await request(app)
      .post(`/api/goals/${id}/contribute`)
      .set(headers)
      .send({ amount: -900 });
    expect(guarded.status).toBe(400);
    expect(guarded.body.error.code).toBe('INSUFFICIENT_FUNDS');

    const withdrawn = await request(app)
      .post(`/api/goals/${id}/contribute`)
      .set(headers)
      .send({ amount: -350 });
    expect(withdrawn.body.data.goal.currentAmount).toBe(500);
    expect(withdrawn.body.data.goal.progress).toBe(33);

    const completed = await request(app)
      .post(`/api/goals/${id}/contribute`)
      .set(headers)
      .send({ amount: 1000 });
    expect(completed.body.data.goal.completed).toBe(true);
    expect(completed.body.data.goal.progress).toBe(100);

    const list = await request(app).get('/api/goals').set(headers);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].targetDate).toBe('2026-12-31');

    const patched = await request(app)
      .patch(`/api/goals/${id}`)
      .set(headers)
      .send({ name: 'New MacBook' });
    expect(patched.body.data.goal.name).toBe('New MacBook');

    const removed = await request(app).delete(`/api/goals/${id}`).set(headers);
    expect(removed.status).toBe(200);
    expect(token).toEqual(expect.any(String));
  });
});

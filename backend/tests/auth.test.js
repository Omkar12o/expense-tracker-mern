const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../src/app');
const Account = require('../src/models/Account');
const User = require('../src/models/User');
const { register, login } = require('./helpers/authHelper');

describe('Auth API', () => {
  it('registers a user, creates default accounts and never exposes the password', async () => {
    const { res, payload, token, user } = await register(app);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(user.email).toBe(payload.email.toLowerCase());
    expect(typeof token).toBe('string');
    expect(user.password).toBeUndefined();

    const accounts = await Account.find({ user: user.id }).lean();
    expect(accounts.map((account) => account.name).sort()).toEqual(['Bank Account', 'Cash']);
  });

  it('rejects duplicate emails case-insensitively with 409', async () => {
    const first = await register(app);
    expect(first.res.status).toBe(201);

    const second = await register(app, { email: first.payload.email.toUpperCase() });
    expect(second.res.status).toBe(409);
    expect(second.res.body.error.code).toBe('EMAIL_IN_USE');
  });

  it('rejects weak passwords and malformed emails', async () => {
    const weak = await register(app, { password: 'short1' });
    expect(weak.res.status).toBe(400);
    expect(weak.res.body.error.code).toBe('VALIDATION_ERROR');

    const badEmail = await register(app, { email: 'not-an-email' });
    expect(badEmail.res.status).toBe(400);
    expect(badEmail.res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('stores the password as a bcrypt hash and ignores unknown fields', async () => {
    const { res, payload, user } = await register(app, { role: 'admin' });
    expect(res.status).toBe(201);

    const stored = await User.findOne({ email: payload.email }).select('+password').lean();
    expect(stored.password).toMatch(/^\$2[aby]\$/);
    expect(await bcrypt.compare(payload.password, stored.password)).toBe(true);
    expect(stored.role).toBeUndefined();
    expect(user.role).toBeUndefined();
  });

  it('logs in with valid credentials', async () => {
    const created = await register(app);
    const res = await login(app, { email: created.payload.email, password: created.payload.password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user.email).toBe(created.payload.email.toLowerCase());
  });

  it('uses the same message for unknown emails and wrong passwords', async () => {
    const created = await register(app);
    const wrongPassword = await login(app, {
      email: created.payload.email,
      password: 'WrongPassword123!',
    });
    const unknownEmail = await login(app, {
      email: 'nobody@example.com',
      password: 'Password123!',
    });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error.message).toBe(unknownEmail.body.error.message);
    expect(wrongPassword.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects NoSQL operator payloads with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: 'Password123!' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

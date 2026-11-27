const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const { env } = require('../src/config/env');
const User = require('../src/models/User');
const { register } = require('./helpers/authHelper');

describe('Protected auth routes', () => {
  it('rejects missing, malformed and forged tokens', async () => {
    const missing = await request(app).get('/api/auth/me');
    expect(missing.status).toBe(401);
    expect(missing.body.error.code).toBe('INVALID_TOKEN');

    const malformed = await request(app).get('/api/auth/me').set('Authorization', 'Bearer abc.def.ghi');
    expect(malformed.status).toBe(401);
    expect(malformed.body.error.code).toBe('INVALID_TOKEN');

    const forged = jwt.sign(
      { sub: new mongoose.Types.ObjectId().toString(), type: 'access' },
      'a-completely-different-secret-that-is-long-enough',
      { algorithm: 'HS256', expiresIn: '1h' },
    );
    const forgedRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${forged}`);
    expect(forgedRes.status).toBe(401);
    expect(forgedRes.body.error.code).toBe('INVALID_TOKEN');
  });

  it('distinguishes expired tokens', async () => {
    const expired = jwt.sign(
      { sub: new mongoose.Types.ObjectId().toString(), type: 'access' },
      env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '-1h' },
    );
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('rejects tokens for users that no longer exist', async () => {
    const created = await register(app);
    await User.deleteOne({ email: created.payload.email });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${created.token}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('returns the current user for a valid token', async () => {
    const created = await register(app);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${created.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(created.payload.email.toLowerCase());
  });

  it('requires a token on every protected GET route', async () => {
    const routes = ['/api/auth/me'];
    for (const route of routes) {
      const res = await request(app).get(route);
      expect(res.status).toBe(401);
    }
  });
});

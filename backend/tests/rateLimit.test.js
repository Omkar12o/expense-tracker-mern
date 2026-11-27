process.env.AUTH_RATE_LIMIT_MAX = '2';

const request = require('supertest');
const app = require('../src/app');

describe('Auth rate limiting', () => {
  it('returns 429 after the configured number of attempts', async () => {
    const payload = { email: 'nobody@example.com', password: 'Password123!' };

    const first = await request(app).post('/api/auth/login').send(payload);
    const second = await request(app).post('/api/auth/login').send(payload);
    const third = await request(app).post('/api/auth/login').send(payload);

    expect(first.status).toBe(401);
    expect(second.status).toBe(401);
    expect(third.status).toBe(429);
    expect(third.body.error.code).toBe('RATE_LIMITED');
  });
});

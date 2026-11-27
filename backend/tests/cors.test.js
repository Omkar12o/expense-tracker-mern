const request = require('supertest');
const app = require('../src/app');
const { env } = require('../src/config/env');

describe('CORS policy', () => {
  it('blocks unknown origins and never enables credentials', async () => {
    const res = await request(app).get('/health').set('Origin', 'https://evil.example');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ORIGIN_NOT_ALLOWED');
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
  });

  it('allows configured origins and exposes the CSV download header', async () => {
    const origin = env.CLIENT_URL[0];
    const res = await request(app).options('/api/auth/login').set('Origin', origin);

    expect(res.status).toBeLessThan(400);
    expect(res.headers['access-control-allow-origin']).toBe(origin);
    expect(res.headers['access-control-expose-headers']).toContain('Content-Disposition');
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
  });
});

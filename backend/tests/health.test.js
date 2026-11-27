const request = require('supertest');
const app = require('../src/app');

const EXPECTED = { success: true, status: 'ok', data: { status: 'ok' } };

describe('Health endpoints', () => {
  it('serves GET /health', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(EXPECTED);
  });

  it('serves GET /api/health without authentication', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(EXPECTED);
  });

  it('keeps other API routes protected', async () => {
    const res = await request(app).get('/api/transactions');

    expect(res.status).toBe(401);
  });
});

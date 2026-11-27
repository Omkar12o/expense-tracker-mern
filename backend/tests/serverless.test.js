jest.mock('../src/config/db', () => ({ connectDB: jest.fn() }));

const request = require('supertest');
const handler = require('../api/index');
const { connectDB } = require('../src/config/db');

const ORIGIN = 'http://localhost:5173';

describe('Vercel serverless handler', () => {
  beforeEach(() => {
    connectDB.mockReset();
    connectDB.mockResolvedValue({});
  });

  it('serves /api/health without connecting to the database', async () => {
    const res = await request(handler).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, status: 'ok', data: { status: 'ok' } });
    expect(connectDB).not.toHaveBeenCalled();
  });

  it('serves a rewritten nested health path without the database', async () => {
    const res = await request(handler).get('/api?__original=/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, status: 'ok', data: { status: 'ok' } });
    expect(connectDB).not.toHaveBeenCalled();
  });

  it('answers CORS preflight without connecting to the database', async () => {
    const res = await request(handler)
      .options('/api?__original=/api/auth/register')
      .set('Origin', ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
    expect(connectDB).not.toHaveBeenCalled();
  });

  it('returns a safe 503 with CORS headers when the database is unavailable', async () => {
    connectDB.mockRejectedValue(new Error('MongoServerSelectionError'));

    const res = await request(handler).get('/api/transactions').set('Origin', ORIGIN);

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('DATABASE_UNAVAILABLE');
    expect(res.body.error.message).toBe('Database is temporarily unavailable.');
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
  });
});

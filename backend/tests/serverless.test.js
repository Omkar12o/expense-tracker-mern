jest.mock('../src/config/db', () => ({ connectDB: jest.fn() }));

const request = require('supertest');
const handler = require('../api/index');
const { connectDB } = require('../src/config/db');

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

  it('returns a safe 503 when the database is unavailable', async () => {
    connectDB.mockRejectedValue(new Error('MongoServerSelectionError'));

    const res = await request(handler).get('/api/transactions');

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('DATABASE_UNAVAILABLE');
    expect(res.body.error.message).toBe('Database is temporarily unavailable.');
  });
});

jest.mock('../src/config/db', () => ({ connectDB: jest.fn().mockResolvedValue({}) }));
jest.mock('../src/app', () =>
  jest.fn((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ url: req.url, originalUrl: req.originalUrl }));
  }),
);

const request = require('supertest');
const handler = require('../api/index');

describe('serverless original URL restoration', () => {
  it('restores a nested path and keeps unrelated query parameters', async () => {
    const res = await request(handler).get('/api?__original=/api/auth/login&next=dashboard');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      url: '/api/auth/login?next=dashboard',
      originalUrl: '/api/auth/login?next=dashboard',
    });
  });

  it('leaves ordinary API paths untouched', async () => {
    const res = await request(handler).get('/api/transactions?range=7d');

    expect(res.status).toBe(200);
    expect(res.body.url).toBe('/api/transactions?range=7d');
  });

  it('rejects an invalid helper path', async () => {
    const res = await request(handler).get('/api?__original=/admin/delete');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_REQUEST_PATH');
  });

  it('rejects path traversal in the helper path', async () => {
    const res = await request(handler).get('/api?__original=/api/../../secrets');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_REQUEST_PATH');
  });
});

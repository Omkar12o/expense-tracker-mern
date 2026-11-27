const request = require('supertest');

function uniqueId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function register(app, overrides = {}) {
  const payload = {
    name: 'Test User',
    email: `user_${uniqueId()}@example.com`,
    password: 'Password123!',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { res, payload, token: res.body?.data?.token, user: res.body?.data?.user };
}

async function login(app, payload) {
  return request(app).post('/api/auth/login').send(payload);
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function defaultAccounts(app, token) {
  const res = await request(app).get('/api/accounts').set(authHeader(token));
  return res.body.data;
}

async function createTransaction(app, token, payload) {
  return request(app).post('/api/transactions').set(authHeader(token)).send(payload);
}

module.exports = { register, login, authHeader, defaultAccounts, createTransaction, uniqueId };

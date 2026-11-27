const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const uriFile = process.env.MONGO_URI_FILE || path.join(os.tmpdir(), 'expense-tracker-mongo-uri.txt');

process.env.NODE_ENV = 'test';
if (fs.existsSync(uriFile)) {
  const base = fs.readFileSync(uriFile, 'utf8').trim();
  const separator = base.endsWith('/') ? '' : '/';
  process.env.MONGO_URI = `${base}${separator}expense_test_${crypto.randomBytes(6).toString('hex')}`;
}

process.env.JWT_SECRET ||= 'test-secret-at-least-32-characters-long';
process.env.JWT_EXPIRES_IN ||= '7d';
process.env.CLIENT_URL ||= 'http://localhost:5173';
process.env.BCRYPT_ROUNDS ||= '4';
process.env.AUTH_RATE_LIMIT_MAX ||= '1000';
process.env.API_RATE_LIMIT_MAX ||= '10000';
process.env.CURRENCY_SYMBOL ||= '$';
process.env.CRON_SECRET ||= 'test-cron-secret-at-least-16-chars';
process.env.PORT ||= '4000';

const { rateLimit } = require('express-rate-limit');
const { env } = require('../config/env');

const WINDOW_MS = 15 * 60 * 1000;

function keyGenerator(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function handler(_req, res, _next, options) {
  return res.status(options.statusCode).json({
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
    },
  });
}

const baseOptions = {
  windowMs: WINDOW_MS,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator,
  handler,
  validate: { trustProxy: true },
};

const apiLimiter = rateLimit({
  ...baseOptions,
  limit: env.API_RATE_LIMIT_MAX,
});

const authLimiter = rateLimit({
  ...baseOptions,
  limit: env.AUTH_RATE_LIMIT_MAX,
});

module.exports = { apiLimiter, authLimiter };

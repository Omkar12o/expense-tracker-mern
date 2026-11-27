const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

async function protect(req, _res, next) {
  try {
    const parts = String(req.headers.authorization || '').trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) {
      throw AppError.unauthorized('Authentication token is required.', 'INVALID_TOKEN');
    }

    let payload;
    try {
      payload = jwt.verify(parts[1], env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Your session has expired. Please sign in again.', 'TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid authentication token.', 'INVALID_TOKEN');
    }

    if (!payload || payload.type !== 'access' || !OBJECT_ID.test(String(payload.sub || ''))) {
      throw AppError.unauthorized('Invalid authentication token.', 'INVALID_TOKEN');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw AppError.unauthorized('This account no longer exists.', 'INVALID_TOKEN');
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { protect };

const { ZodError } = require('zod');
const { env } = require('../config/env');
const AppError = require('../utils/AppError');

function notFound(req, _res, next) {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} was not found.`));
}

function normalize(error) {
  if (error instanceof AppError) return error;

  if (error instanceof ZodError) {
    return AppError.badRequest('Invalid request.', 'VALIDATION_ERROR', error.flatten());
  }

  if (error && error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return AppError.conflict(`A record with this ${field} already exists.`, 'DUPLICATE_KEY');
  }

  if (error && error.name === 'CastError') {
    return AppError.badRequest(`Invalid value for ${error.path}.`, 'INVALID_VALUE');
  }

  if (error && error.type === 'entity.parse.failed') {
    return AppError.badRequest('Request body contains invalid JSON.', 'INVALID_JSON');
  }

  if (error && error.type === 'entity.too.large') {
    return new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  }

  return new AppError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again later.');
}

function errorHandler(error, _req, res, _next) {
  const normalized = normalize(error);

  if (normalized.statusCode >= 500 && !env.isProd) {
    console.error(error);
  }

  const body = {
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
    },
  };

  if (normalized.details !== undefined && normalized.statusCode < 500) {
    body.error.details = normalized.details;
  }

  return res.status(normalized.statusCode).json(body);
}

module.exports = { errorHandler, notFound };

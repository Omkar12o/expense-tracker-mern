class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    if (details !== undefined) this.details = details;
    if (Error.captureStackTrace) Error.captureStackTrace(this, AppError);
  }

  static badRequest(message = 'Invalid request.', code = 'BAD_REQUEST', details) {
    return new AppError(400, code, message, details);
  }

  static unauthorized(message = 'Authentication required.', code = 'UNAUTHORIZED') {
    return new AppError(401, code, message);
  }

  static forbidden(message = 'You do not have access to this resource.', code = 'FORBIDDEN') {
    return new AppError(403, code, message);
  }

  static notFound(message = 'Resource not found.', code = 'NOT_FOUND') {
    return new AppError(404, code, message);
  }

  static conflict(message = 'This resource conflicts with an existing record.', code = 'CONFLICT') {
    return new AppError(409, code, message);
  }
}

module.exports = AppError;

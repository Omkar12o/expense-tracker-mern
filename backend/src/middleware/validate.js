const AppError = require('../utils/AppError');

function validate(schemas = {}) {
  return (req, _res, next) => {
    if (req.suspiciousQueryKeys && req.suspiciousQueryKeys.length > 0) {
      return next(
        AppError.badRequest(
          `Query parameter "${req.suspiciousQueryKeys[0]}" is not allowed.`,
          'INVALID_QUERY',
          { keys: req.suspiciousQueryKeys },
        ),
      );
    }

    req.valid = req.valid || {};
    const sources = {
      params: req.params || {},
      query: req.sanitizedQuery || {},
      body: req.body === undefined ? {} : req.body,
    };

    for (const part of ['params', 'query', 'body']) {
      const schema = schemas[part];
      if (!schema) {
        req.valid[part] = sources[part];
        continue;
      }

      const result = schema.safeParse(sources[part]);
      if (!result.success) {
        return next(
          AppError.badRequest('Invalid request.', 'VALIDATION_ERROR', {
            source: part,
            issues: result.error.flatten(),
          }),
        );
      }
      req.valid[part] = result.data;
    }

    return next();
  };
}

module.exports = validate;

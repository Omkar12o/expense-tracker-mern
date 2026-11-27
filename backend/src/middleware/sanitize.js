const { stripHtml } = require('../utils/text');

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function suspiciousKey(key) {
  return key.startsWith('$') || key.includes('.');
}

function clean(value, state) {
  if (typeof value === 'string') return stripHtml(value);
  if (Array.isArray(value)) return value.map((item) => clean(item, state));
  if (!isPlainObject(value)) return value;

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (suspiciousKey(key)) {
      state.keys.push(key);
      continue;
    }
    result[key] = clean(item, state);
  }
  return result;
}

function sanitizeRequest(req, _res, next) {
  const queryState = { keys: [] };
  req.sanitizedQuery = clean(req.query || {}, queryState);
  req.suspiciousQueryKeys = queryState.keys;

  if (req.body !== undefined) {
    const bodyState = { keys: [] };
    req.body = clean(req.body, bodyState);
    req.removedBodyKeys = bodyState.keys;
  }

  next();
}

module.exports = sanitizeRequest;

const LOCAL_URI = /localhost|127\.0\.0\.1|\[::1\]/i;
const PLACEHOLDER = /your[-_]?password|<[^>]+>|replace[-_]?with|example\.com/i;
const PREFIX = /^(?:export\s+)?MONGO_URI\s*=\s*/i;
const QUOTES = /^(['"])([\s\S]*)\1$/;

function normalizeMongoUri(raw) {
  let value = String(raw ?? '').replace(/^\uFEFF/, '').trim();

  while (PREFIX.test(value)) {
    value = value.replace(PREFIX, '').trim();
  }
  while (QUOTES.test(value)) {
    value = value.replace(QUOTES, '$2').trim();
  }

  return value;
}

function validateMongoUri(value, options = {}) {
  const production = options.production === true;
  const issues = [];

  if (!value) {
    issues.push('MONGO_URI is required.');
    return issues;
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(value)) {
    issues.push(
      'MONGO_URI must start with "mongodb://" or "mongodb+srv://". Remove any MONGO_URI= prefix, quotes, or whitespace from the Vercel value.',
    );
  }
  if (production && LOCAL_URI.test(value)) {
    issues.push('MONGO_URI must not point to localhost in production.');
  }
  if (production && PLACEHOLDER.test(value)) {
    issues.push('MONGO_URI still contains a placeholder. Replace it with the real Atlas password.');
  }

  return issues;
}

function maskMongoUri(uri) {
  const raw = String(uri || '');
  try {
    const parsed = new URL(raw);
    const credentials = parsed.username ? `${parsed.username}:***@` : '';
    return `${parsed.protocol}//${credentials}${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch {
    return '<invalid URI>';
  }
}

function safeMongoError(error, uri) {
  const name = error && error.name ? error.name : 'Error';
  const code = error && error.code ? ` (${error.code})` : '';
  let message = String(error && error.message ? error.message : error || 'Unknown error');

  if (uri) {
    message = message.split(String(uri)).join(maskMongoUri(uri));
    message = message.split(normalizeMongoUri(uri)).join(maskMongoUri(uri));
  }

  message = message.replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, 'mongodb$1://***@');
  message = message.replace(/(MONGO_URI\s*=\s*)(\S+)/gi, (_match, prefix, value) => `${prefix}${maskMongoUri(value)}`);

  return `${name}${code}: ${message}`;
}

module.exports = { normalizeMongoUri, validateMongoUri, maskMongoUri, safeMongoError };

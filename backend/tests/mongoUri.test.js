const {
  normalizeMongoUri,
  validateMongoUri,
  maskMongoUri,
  safeMongoError,
} = require('../src/utils/mongoUri');

const URI = 'mongodb+srv://db_user:super-secret-123@cluster0.example.mongodb.net/expense-tracker?retryWrites=true';

describe('MongoDB URI utilities', () => {
  it('removes BOM, whitespace, prefixes and surrounding quotes', () => {
    const raw = `\uFEFF  export MONGO_URI="${URI}"  \n`;
    expect(normalizeMongoUri(raw)).toBe(URI);
  });

  it('rejects an invalid scheme with an actionable message', () => {
    const issues = validateMongoUri('MONGO_URI=mongodb+srv://user@host/db');
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatch(/mongodb:\/\/|mongodb\+srv:\/\//);
  });

  it('rejects localhost and placeholders in production', () => {
    const local = validateMongoUri('mongodb://127.0.0.1:27017/expense-tracker', { production: true });
    const placeholder = validateMongoUri('mongodb+srv://user:YOUR_PASSWORD@cluster0.mongodb.net/db', {
      production: true,
    });

    expect(local.join(' ')).toMatch(/localhost/i);
    expect(placeholder.join(' ')).toMatch(/placeholder/i);
  });

  it('masks credentials in URIs and error messages', () => {
    expect(maskMongoUri(URI)).not.toContain('super-secret-123');
    expect(maskMongoUri(URI)).toContain('db_user:***@');

    const error = new Error(`Invalid scheme for ${URI}`);
    error.name = 'MongoParseError';
    const safe = safeMongoError(error, URI);

    expect(safe).toContain('MongoParseError');
    expect(safe).not.toContain('super-secret-123');
    expect(safe).not.toContain(URI);
  });
});

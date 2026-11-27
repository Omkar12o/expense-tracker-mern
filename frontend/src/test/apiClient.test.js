import { describe, expect, it } from 'vitest';
import { normalizeApiUrl } from '../api/client';

describe('normalizeApiUrl', () => {
  it('uses the local API when no value is configured', () => {
    expect(normalizeApiUrl('')).toBe('http://localhost:4000/api');
  });

  it('appends /api to a bare backend origin', () => {
    expect(normalizeApiUrl('https://expense-tracker-mern-qgx7.vercel.app')).toBe(
      'https://expense-tracker-mern-qgx7.vercel.app/api',
    );
  });

  it('keeps an already-correct API URL and removes trailing slashes', () => {
    expect(normalizeApiUrl('https://example.vercel.app/api/')).toBe('https://example.vercel.app/api');
  });
});

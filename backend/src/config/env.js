const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const isProd = process.env.NODE_ENV === 'production';

const secretSchema = isProd
  ? z.string().min(32, 'JWT_SECRET must be at least 32 characters in production.')
  : z.string().min(16, 'JWT_SECRET must be at least 16 characters.');

const cronSecretSchema = isProd
  ? z.string().min(32, 'CRON_SECRET must be at least 32 characters in production.')
  : z.string().min(16, 'CRON_SECRET must be at least 16 characters.').default('local-dev-cron-secret-change-me');

const bcryptRoundsSchema = isProd
  ? z.coerce.number().int().min(12, 'BCRYPT_ROUNDS must be at least 12 in production.').max(15)
  : z.coerce.number().int().min(4).max(15);

const clientUrlSchema = z
  .string()
  .min(1)
  .transform((value) =>
    value
      .split(',')
      .map((origin) => origin.trim().replace(/\/+$/, ''))
      .filter(Boolean),
  )
  .pipe(z.array(z.string().url()).min(1, 'CLIENT_URL must contain at least one URL.'));

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required.'),
    JWT_SECRET: secretSchema,
    JWT_EXPIRES_IN: z
      .string()
      .regex(/^\d+(s|m|h|d)$/, 'JWT_EXPIRES_IN must look like 7d, 12h or 30m.')
      .default('7d'),
    CLIENT_URL: clientUrlSchema.default('http://localhost:5173'),
    BCRYPT_ROUNDS: bcryptRoundsSchema.default(12),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(20),
    API_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(1000),
    CURRENCY_SYMBOL: z.string().trim().min(1).max(5).default('$'),
    CRON_SECRET: cronSecretSchema,
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  })
  .passthrough();

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment configuration: ${JSON.stringify(details)}`);
}

module.exports = { env: Object.freeze({ ...parsed.data, isProd }) };

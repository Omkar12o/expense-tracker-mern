const { z } = require('zod');
const { email } = require('./common');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be at most 128 characters.')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
  .regex(/\d/, 'Password must contain at least one number.');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(60),
  email,
  password,
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.').max(128),
});

module.exports = { registerSchema, loginSchema };

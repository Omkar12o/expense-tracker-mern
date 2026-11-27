const { z } = require('zod');
const { email, username } = require('./common');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be at most 128 characters.')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
  .regex(/\d/, 'Password must contain at least one number.');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(60),
  username,
  email,
  password,
});

// `email` is kept as an optional legacy alias so existing accounts can still sign in.
const loginSchema = z
  .object({
    username: z.string().trim().max(120).optional(),
    email: z.string().trim().max(120).optional(),
    password: z.string().min(1, 'Password is required.').max(128),
  })
  .refine((value) => Boolean(value.username || value.email), {
    message: 'Username is required.',
    path: ['username'],
  });

module.exports = { registerSchema, loginSchema };

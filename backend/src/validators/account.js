const { z } = require('zod');
const { objectId, shortText } = require('./common');
const { ACCOUNT_TYPES } = require('../utils/constants');

const balance = z
  .number()
  .finite()
  .nonnegative('Initial balance cannot be negative.')
  .max(1000000000, 'Initial balance is too large.')
  .transform((value) => Math.round((value + Number.EPSILON) * 100) / 100);

const accountFields = z.object({
  name: shortText(40, 'Account name').min(1, 'Account name is required.'),
  type: z.enum(ACCOUNT_TYPES),
  initialBalance: balance,
});

const createAccountSchema = z.object({
  name: accountFields.shape.name,
  type: accountFields.shape.type,
  initialBalance: balance.optional(),
});

const patchAccountSchema = z
  .object({
    name: accountFields.shape.name.optional(),
    type: accountFields.shape.type.optional(),
    initialBalance: balance.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

const idParamSchema = z.object({ id: objectId });

module.exports = { createAccountSchema, patchAccountSchema, idParamSchema };

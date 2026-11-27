const { z } = require('zod');
const { objectId, dateString, money, nonNegativeMoney, shortText } = require('./common');

const goalFields = z.object({
  name: shortText(60, 'Goal name').min(1, 'Goal name is required.'),
  targetAmount: money,
  currentAmount: nonNegativeMoney,
  targetDate: dateString.nullable(),
});

const createGoalSchema = z.object({
  name: goalFields.shape.name,
  targetAmount: goalFields.shape.targetAmount,
  currentAmount: goalFields.shape.currentAmount.optional(),
  targetDate: goalFields.shape.targetDate.optional(),
});

const patchGoalSchema = z
  .object({
    name: goalFields.shape.name.optional(),
    targetAmount: goalFields.shape.targetAmount.optional(),
    targetDate: goalFields.shape.targetDate.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

const contributeSchema = z
  .object({
    amount: z
      .number()
      .finite()
      .refine((value) => Math.abs(value) >= 0.01, 'Amount must be at least 0.01.')
      .refine((value) => Math.abs(value) <= 1000000000, 'Amount is too large.')
      .transform((value) => Math.round((value + Number.EPSILON) * 100) / 100),
  })
  .refine((value) => value.amount !== 0, 'Amount cannot be zero.');

const idParamSchema = z.object({ id: objectId });

module.exports = { createGoalSchema, patchGoalSchema, contributeSchema, idParamSchema };

const { z } = require('zod');
const { objectId, dateString, money, amountFilter, httpUrl, shortText } = require('./common');
const { RECURRENCE_FREQUENCIES } = require('../utils/constants');

const recurrenceSchema = z
  .object({
    frequency: z.enum(RECURRENCE_FREQUENCIES),
    nextDate: dateString.optional(),
    anchorDay: z.number().int().min(1).max(31).optional(),
    endDate: dateString.optional(),
  })
  .refine((value) => !value.endDate || !value.nextDate || value.endDate >= value.nextDate, {
    message: 'endDate must be on or after nextDate.',
    path: ['endDate'],
  });

const baseFields = {
  type: z.enum(['income', 'expense']),
  amount: money,
  category: shortText(30, 'Category').min(1, 'Category is required.'),
  account: objectId,
  note: shortText(200, 'Note').optional(),
  date: dateString.optional(),
  attachment: httpUrl.optional().or(z.literal('')),
  isRecurring: z.boolean(),
  recurrence: recurrenceSchema.nullable().optional(),
};

const createTransactionSchema = z.object({
  ...baseFields,
  note: baseFields.note.default(''),
  isRecurring: baseFields.isRecurring.default(false),
});

const patchTransactionSchema = z
  .object({
    type: baseFields.type.optional(),
    amount: baseFields.amount.optional(),
    category: baseFields.category.optional(),
    account: baseFields.account.optional(),
    note: baseFields.note.optional(),
    date: baseFields.date.optional(),
    attachment: baseFields.attachment.optional().nullable(),
    isRecurring: baseFields.isRecurring.optional(),
    recurrence: baseFields.recurrence.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

const listTransactionsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    type: z.enum(['income', 'expense']).optional(),
    category: shortText(30, 'Category').optional(),
    account: objectId.optional(),
    from: dateString.optional(),
    to: dateString.optional(),
    minAmount: amountFilter.optional(),
    maxAmount: amountFilter.optional(),
    search: shortText(100, 'Search').optional(),
    recurring: z.enum(['true', 'false']).optional(),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'from must be on or before to.',
    path: ['from'],
  })
  .refine((value) => value.minAmount === undefined || value.maxAmount === undefined || value.minAmount <= value.maxAmount, {
    message: 'minAmount must be less than or equal to maxAmount.',
    path: ['minAmount'],
  });

const idParamSchema = z.object({ id: objectId });

module.exports = {
  createTransactionSchema,
  patchTransactionSchema,
  listTransactionsQuerySchema,
  idParamSchema,
};

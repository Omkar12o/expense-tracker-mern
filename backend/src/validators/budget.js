const { z } = require('zod');
const { objectId, monthString, money, shortText } = require('./common');

const setBudgetSchema = z.object({
  month: monthString,
  category: shortText(30, 'Category').min(1).optional().nullable(),
  amount: money,
});

const listBudgetQuerySchema = z.object({ month: monthString.optional() });

const idParamSchema = z.object({ id: objectId });

module.exports = { setBudgetSchema, listBudgetQuerySchema, idParamSchema };

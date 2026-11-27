const { z } = require('zod');
const { objectId, shortText } = require('./common');

const createCategorySchema = z.object({
  name: shortText(30, 'Category name').min(1, 'Category name is required.'),
  type: z.enum(['income', 'expense']),
  icon: shortText(16, 'Icon').min(1).default('📦'),
});

const idParamSchema = z.object({ id: objectId });

module.exports = { createCategorySchema, idParamSchema };

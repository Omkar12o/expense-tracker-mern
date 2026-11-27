const { z } = require('zod');

const analyticsQuerySchema = z.object({
  range: z.enum(['week', 'month', '3months', 'year']).optional(),
});

module.exports = { analyticsQuerySchema };

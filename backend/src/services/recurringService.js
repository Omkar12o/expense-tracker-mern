const Transaction = require('../models/Transaction');
const { advanceDate } = require('../utils/recurrence');
const { startOfUTCDay, todayUTC } = require('../utils/dates');

function isoDay(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

async function processTemplate(templateId, today) {
  let created = 0;

  for (let iteration = 0; iteration < 1000; iteration += 1) {
    const template = await Transaction.findById(templateId);
    if (!template || !template.isRecurring || !template.recurrence) break;

    const nextDate = isoDay(template.recurrence.nextDate);
    const endDate = isoDay(template.recurrence.endDate);
    if (!nextDate || nextDate > today || (endDate && nextDate > endDate)) break;

    const advanced = advanceDate(nextDate, template.recurrence.frequency, template.recurrence.anchorDay);
    const claimed = await Transaction.findOneAndUpdate(
      {
        _id: templateId,
        isRecurring: true,
        'recurrence.nextDate': template.recurrence.nextDate,
      },
      { $set: { 'recurrence.nextDate': startOfUTCDay(advanced) } },
      { returnDocument: 'after' },
    );
    if (!claimed) continue;

    await Transaction.create({
      user: template.user,
      type: template.type,
      amount: template.amount,
      category: template.category,
      account: template.account,
      note: template.note,
      date: startOfUTCDay(nextDate),
      attachment: template.attachment,
      isRecurring: false,
      recurrence: null,
      recurringSource: template._id,
    });
    created += 1;
  }

  return created;
}

async function processDueRecurring(userId = null) {
  const today = todayUTC();
  const filter = {
    isRecurring: true,
    'recurrence.nextDate': { $lte: startOfUTCDay(today) },
  };
  if (userId) filter.user = userId;

  const templates = await Transaction.find(filter).select('_id').lean();
  let created = 0;
  for (const template of templates) {
    created += await processTemplate(template._id, today);
  }
  return created;
}

module.exports = { processDueRecurring, processTemplate };

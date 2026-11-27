const Transaction = require('../models/Transaction');
const accountService = require('./accountService');
const categoryService = require('./categoryService');
const AppError = require('../utils/AppError');
const { buildTransactionFilter } = require('../utils/transactionFilter');
const { buildRecurrence } = require('../utils/recurrence');
const { streamCsv } = require('../utils/csv');
const { startOfUTCDay, todayUTC } = require('../utils/dates');
const { roundMoney } = require('../utils/text');

function isoDay(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

function decorate(doc, icons = new Map()) {
  const account = doc.account && typeof doc.account === 'object' ? doc.account : null;
  const recurrence = doc.recurrence
    ? {
        frequency: doc.recurrence.frequency,
        nextDate: isoDay(doc.recurrence.nextDate),
        anchorDay: doc.recurrence.anchorDay,
        endDate: recurrenceEnd(doc.recurrence.endDate),
      }
    : null;

  return {
    id: doc._id.toString(),
    type: doc.type,
    amount: roundMoney(doc.amount),
    category: doc.category,
    categoryIcon: icons.get(`${doc.type}:${doc.category.toLowerCase()}`) || '',
    account: account
      ? { id: account._id.toString(), name: account.name, type: account.type }
      : null,
    note: doc.note || '',
    date: isoDay(doc.date),
    attachment: doc.attachment || null,
    isRecurring: Boolean(doc.isRecurring),
    recurrence,
    recurringSource: doc.recurringSource ? doc.recurringSource.toString() : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function recurrenceEnd(value) {
  return value ? isoDay(value) : null;
}

async function icons(userId) {
  return categoryService.iconMap(userId);
}

async function findOwned(userId, id) {
  const transaction = await Transaction.findOne({ _id: id, user: userId }).populate({
    path: 'account',
    select: 'name type',
  });
  if (!transaction) throw AppError.notFound('Transaction not found.', 'TRANSACTION_NOT_FOUND');
  return transaction;
}

async function prepare(userId, input, existing = null) {
  const type = input.type ?? existing?.type;
  const account = input.account ?? existing?.account?._id ?? existing?.account;
  await accountService.getOwned(userId, account);

  const categoryInput = input.category ?? existing?.category;
  const resolved = await categoryService.resolve(userId, type, categoryInput);
  const dateString = input.date ?? isoDay(existing?.date) ?? todayUTC();
  const isRecurring = input.isRecurring ?? existing?.isRecurring ?? false;
  const recurrence = buildRecurrence({
    dateString,
    recurrenceInput: input.recurrence === null ? undefined : input.recurrence,
    existing,
    isRecurring,
  });

  return {
    type,
    amount: input.amount ?? existing?.amount,
    category: resolved.name,
    account,
    note: input.note ?? existing?.note ?? '',
    date: startOfUTCDay(dateString),
    attachment: input.attachment === '' ? null : (input.attachment ?? existing?.attachment ?? null),
    isRecurring,
    recurrence,
    recurringSource: isRecurring ? (existing?.recurringSource ?? null) : null,
    dateString,
  };
}

async function create(userId, body) {
  const { dateString: _dateString, ...fields } = await prepare(userId, body);
  const transaction = await Transaction.create({ ...fields, user: userId });
  const populated = await findOwned(userId, transaction._id);
  return decorate(populated, await icons(userId));
}

async function update(userId, id, patch) {
  const transaction = await findOwned(userId, id);
  const { dateString: _dateString, ...fields } = await prepare(userId, patch, transaction);
  Object.assign(transaction, fields);
  await transaction.save();
  const populated = await findOwned(userId, id);
  return decorate(populated, await icons(userId));
}

async function getById(userId, id) {
  const transaction = await findOwned(userId, id);
  return decorate(transaction, await icons(userId));
}

async function remove(userId, id) {
  const transaction = await Transaction.findOneAndDelete({ _id: id, user: userId });
  if (!transaction) throw AppError.notFound('Transaction not found.', 'TRANSACTION_NOT_FOUND');
  return { message: 'Transaction deleted.' };
}

async function list(userId, query) {
  const filter = buildTransactionFilter(userId, query);
  const [items, total, summaryRows] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate({ path: 'account', select: 'name type' })
      .lean(),
    Transaction.countDocuments(filter),
    Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        },
      },
    ]),
  ]);

  const totals = summaryRows[0] || { income: 0, expense: 0 };
  const map = await icons(userId);
  return {
    items: items.map((item) => decorate(item, map)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: total === 0 ? 0 : Math.ceil(total / query.limit),
    },
    summary: {
      income: roundMoney(totals.income),
      expense: roundMoney(totals.expense),
      net: roundMoney(totals.income - totals.expense),
    },
  };
}

async function exportCsv(userId, query, res) {
  const filter = buildTransactionFilter(userId, query);
  const map = await icons(userId);

  const cursor = Transaction.find(filter)
    .sort({ date: -1, _id: -1 })
    .populate({ path: 'account', select: 'name' })
    .lean()
    .cursor();

  const rows = (async function* generateRows() {
    for await (const doc of cursor) {
      const decorated = decorate(doc, map);
      yield [
        decorated.date,
        decorated.type === 'income' ? 'Income' : 'Expense',
        decorated.category,
        decorated.account?.name || '',
        decorated.amount.toFixed(2),
        decorated.note,
      ];
    }
  })();

  await streamCsv(res, rows);
}

module.exports = { create, update, getById, remove, list, exportCsv };

const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');
const { roundMoney } = require('../utils/text');

const COLLATION = { locale: 'en', strength: 2 };

function decorate(account, income = 0, expense = 0) {
  const initialBalance = roundMoney(account.initialBalance || 0);
  return {
    id: account._id.toString(),
    name: account.name,
    type: account.type,
    initialBalance,
    income: roundMoney(income),
    expense: roundMoney(expense),
    balance: roundMoney(initialBalance + income - expense),
  };
}

async function statsFor(userId, accountIds) {
  const rows = await Transaction.aggregate([
    { $match: { user: userId, account: { $in: accountIds } } },
    {
      $group: {
        _id: { account: '$account', type: '$type' },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const map = new Map();
  for (const row of rows) {
    const key = row._id.account.toString();
    if (!map.has(key)) map.set(key, { income: 0, expense: 0 });
    map.get(key)[row._id.type] = roundMoney(row.total);
  }
  return map;
}

async function list(userId) {
  const accounts = await Account.find({ user: userId }).sort({ createdAt: 1 }).lean();
  const stats = await statsFor(userId, accounts.map((account) => account._id));
  const items = accounts.map((account) => {
    const values = stats.get(account._id.toString()) || { income: 0, expense: 0 };
    return decorate(account, values.income, values.expense);
  });
  const total = roundMoney(items.reduce((sum, item) => sum + item.balance, 0));
  return { items, total };
}

async function getOwned(userId, id) {
  const account = await Account.findOne({ _id: id, user: userId });
  if (!account) {
    throw AppError.badRequest('account must be one of your accounts.', 'INVALID_ACCOUNT');
  }
  return account;
}

async function assertNameAvailable(userId, name, excludeId = null) {
  const filter = { user: userId, name };
  if (excludeId) filter._id = { $ne: excludeId };
  const existing = await Account.findOne(filter).collation(COLLATION).lean();
  if (existing) throw AppError.conflict('You already have an account with this name.', 'ACCOUNT_EXISTS');
}

async function create(userId, input) {
  const name = input.name.trim();
  await assertNameAvailable(userId, name);
  const account = await Account.create({
    user: userId,
    name,
    type: input.type,
    initialBalance: input.initialBalance ?? 0,
  });
  return decorate(account);
}

async function update(userId, id, patch) {
  const account = await Account.findOne({ _id: id, user: userId });
  if (!account) throw AppError.notFound('Account not found.', 'ACCOUNT_NOT_FOUND');

  if (patch.name !== undefined) {
    const name = patch.name.trim();
    await assertNameAvailable(userId, name, id);
    account.name = name;
  }
  if (patch.type !== undefined) account.type = patch.type;
  if (patch.initialBalance !== undefined) account.initialBalance = patch.initialBalance;
  await account.save();

  const result = await list(userId);
  return result.items.find((item) => item.id === id.toString());
}

async function remove(userId, id) {
  const account = await Account.findOne({ _id: id, user: userId });
  if (!account) throw AppError.notFound('Account not found.', 'ACCOUNT_NOT_FOUND');

  const used = await Transaction.exists({ user: userId, account: id });
  if (used) {
    throw AppError.conflict('This account has transactions and cannot be deleted.', 'ACCOUNT_IN_USE');
  }

  await account.deleteOne();
  return { message: 'Account deleted.' };
}

async function decoratedAccount(userId, id) {
  const account = await Account.findOne({ _id: id, user: userId }).lean();
  if (!account) throw AppError.notFound('Account not found.', 'ACCOUNT_NOT_FOUND');
  const stats = await statsFor(userId, [account._id]);
  const values = stats.get(id.toString()) || { income: 0, expense: 0 };
  return decorate(account, values.income, values.expense);
}

module.exports = { list, create, update, remove, getOwned, decoratedAccount };

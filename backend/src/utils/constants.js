const ACCOUNT_TYPES = ['Cash', 'Bank Account', 'Credit Card', 'Wallet', 'Savings'];

const BUILTIN_CATEGORIES = {
  expense: [
    { name: 'Food', icon: '🍔' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Bills', icon: '🧾' },
    { name: 'Rent', icon: '🏠' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Health', icon: '🩺' },
    { name: 'Education', icon: '📚' },
    { name: 'Subscription', icon: '🔁' },
    { name: 'Other', icon: '📦' },
  ],
  income: [
    { name: 'Salary', icon: '💼' },
    { name: 'Freelance', icon: '🧑‍💻' },
    { name: 'Business', icon: '🏢' },
    { name: 'Investment', icon: '📈' },
    { name: 'Gift', icon: '🎁' },
    { name: 'Other', icon: '📦' },
  ],
};

const DEFAULT_ACCOUNTS = [
  { name: 'Cash', type: 'Cash' },
  { name: 'Bank Account', type: 'Bank Account' },
];

const BUDGET_LEVELS = ['ok', 'warning', 'high', 'critical', 'exceeded'];

const RECURRENCE_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];

module.exports = {
  ACCOUNT_TYPES,
  BUILTIN_CATEGORIES,
  DEFAULT_ACCOUNTS,
  BUDGET_LEVELS,
  RECURRENCE_FREQUENCIES,
};

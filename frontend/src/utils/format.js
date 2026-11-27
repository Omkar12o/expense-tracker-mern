const SYMBOL = import.meta.env.VITE_CURRENCY || '$';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function currency(value = 0) {
  return formatter.format(Number(value) || 0).replace('$', SYMBOL);
}

function signedCurrency(type, value = 0) {
  const prefix = type === 'income' ? '+' : '-';
  return `${prefix}${currency(value)}`;
}

function percent(value = 0) {
  return `${Math.round(Number(value) || 0)}%`;
}

function compactCurrency(value = 0) {
  const number = Number(value) || 0;
  if (Math.abs(number) >= 1000) return `${SYMBOL}${(number / 1000).toFixed(1)}k`;
  return `${SYMBOL}${number.toFixed(0)}`;
}

export { SYMBOL, currency, signedCurrency, percent, compactCurrency };

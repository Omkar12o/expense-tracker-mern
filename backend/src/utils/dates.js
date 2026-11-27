const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-\d{2}$/;

function isValidDateString(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidMonthString(value) {
  if (typeof value !== 'string' || !MONTH_PATTERN.test(value)) return false;
  const month = Number(value.slice(5));
  return month >= 1 && month <= 12;
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 7);
}

function startOfUTCDay(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function shiftUTC(dateString, days) {
  const date = startOfUTCDay(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function shiftMonth(monthString, delta) {
  if (!isValidMonthString(monthString)) return monthString;
  const [year, month] = monthString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

function startOfMonth(monthString) {
  return `${monthString}-01`;
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function monthLabel(monthString) {
  if (!isValidMonthString(monthString)) return monthString;
  return new Date(`${monthString}-01T00:00:00.000Z`).toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  });
}

module.exports = {
  DATE_PATTERN,
  MONTH_PATTERN,
  isValidDateString,
  isValidMonthString,
  todayUTC,
  monthKey,
  startOfUTCDay,
  shiftUTC,
  shiftMonth,
  startOfMonth,
  daysInMonth,
  monthLabel,
};

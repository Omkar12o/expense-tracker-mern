const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const shortFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: '2-digit',
  month: 'short',
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'long',
  year: 'numeric',
});

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return todayUTC().slice(0, 7);
}

function formatDate(value) {
  if (!value) return '—';
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatShortDate(value) {
  if (!value) return '—';
  return shortFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatMonth(value) {
  if (!value) return '—';
  return monthFormatter.format(new Date(`${value}-01T00:00:00Z`));
}

export { todayUTC, currentMonth, formatDate, formatShortDate, formatMonth };

const AppError = require('./AppError');
const { startOfUTCDay, daysInMonth, shiftUTC } = require('./dates');

function dayOf(dateString) {
  return Number(String(dateString).slice(8, 10));
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function advanceDate(dateString, frequency, anchorDay) {
  const [year, month] = String(dateString).slice(0, 7).split('-').map(Number);
  const day = anchorDay || dayOf(dateString);

  if (frequency === 'daily') return shiftUTC(dateString, 1);
  if (frequency === 'weekly') return shiftUTC(dateString, 7);

  let targetYear = year;
  let targetMonth = month;
  if (frequency === 'monthly') {
    targetYear = month === 12 ? year + 1 : year;
    targetMonth = month === 12 ? 1 : month + 1;
  } else if (frequency === 'yearly') {
    targetYear = year + 1;
  } else {
    return shiftUTC(dateString, 1);
  }

  const safeDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return `${targetYear}-${pad(targetMonth)}-${pad(safeDay)}`;
}

function plainRecurrence(existing) {
  if (!existing || !existing.recurrence) return null;
  const current = existing.recurrence;
  return {
    frequency: current.frequency,
    nextDate: new Date(current.nextDate).toISOString().slice(0, 10),
    anchorDay: current.anchorDay,
    endDate: current.endDate ? new Date(current.endDate).toISOString().slice(0, 10) : null,
  };
}

function buildRecurrence({
  dateString,
  dateChanged = false,
  recurrenceInput,
  existing = null,
  isRecurring = false,
}) {
  if (!isRecurring) return null;

  const previous = plainRecurrence(existing);
  const frequency = recurrenceInput?.frequency || previous?.frequency;
  if (!frequency) {
    throw AppError.badRequest(
      'A frequency is required when isRecurring is true.',
      'RECURRENCE_REQUIRED',
    );
  }

  const frequencyChanged = Boolean(
    recurrenceInput?.frequency && (!previous || recurrenceInput.frequency !== previous.frequency),
  );
  const reset = !previous || dateChanged || frequencyChanged;

  const anchorDay =
    recurrenceInput?.anchorDay || (reset ? dayOf(dateString) : previous.anchorDay);
  const nextDate =
    recurrenceInput?.nextDate ||
    (reset ? advanceDate(dateString, frequency, anchorDay) : previous.nextDate);
  const endDate =
    recurrenceInput && Object.prototype.hasOwnProperty.call(recurrenceInput, 'endDate')
      ? recurrenceInput.endDate
      : previous?.endDate;

  return {
    frequency,
    nextDate: startOfUTCDay(nextDate),
    anchorDay,
    endDate: endDate ? startOfUTCDay(endDate) : null,
  };
}

module.exports = { advanceDate, buildRecurrence, plainRecurrence };

const AppError = require('./AppError');
const { startOfUTCDay } = require('./dates');

function dayOf(dateString) {
  return Number(String(dateString).slice(8, 10));
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

function buildRecurrence({ dateString, recurrenceInput, existing = null, isRecurring = false }) {
  if (!isRecurring) return null;

  const previous = plainRecurrence(existing);
  const frequency = recurrenceInput?.frequency || previous?.frequency;
  if (!frequency) {
    throw AppError.badRequest(
      'A frequency is required when isRecurring is true.',
      'RECURRENCE_REQUIRED',
    );
  }

  const dateChanged = Boolean(dateString && (!previous || dateString !== previous.nextDate));
  const frequencyChanged = Boolean(
    recurrenceInput?.frequency && (!previous || recurrenceInput.frequency !== previous.frequency),
  );
  const reset = !previous || dateChanged || frequencyChanged;

  const nextDate = recurrenceInput?.nextDate || (reset ? dateString : previous.nextDate);
  const anchorDay =
    recurrenceInput?.anchorDay || (reset ? dayOf(dateString) : previous.anchorDay);
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

module.exports = { buildRecurrence, plainRecurrence };

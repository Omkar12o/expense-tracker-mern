import { useState } from 'react';
import { Link } from 'react-router-dom';
import { todayUTC } from '../../utils/dates';
import { currency } from '../../utils/format';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import RecurringFields from './RecurringFields';

function initialState(transaction) {
  return {
    type: transaction?.type || 'expense',
    amount: transaction ? String(transaction.amount) : '',
    category: transaction?.category || '',
    account: transaction?.account?.id || '',
    date: transaction?.date || todayUTC(),
    note: transaction?.note || '',
    attachment: transaction?.attachment || '',
    isRecurring: Boolean(transaction?.isRecurring),
    frequency: transaction?.recurrence?.frequency || 'monthly',
    nextDate: transaction?.recurrence?.nextDate || '',
    anchorDay: transaction?.recurrence?.anchorDay ? String(transaction.recurrence.anchorDay) : '',
    endDate: transaction?.recurrence?.endDate || '',
  };
}

function validate(values) {
  const errors = {};
  const amount = Number(values.amount);
  if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Enter an amount greater than zero.';
  if (!values.category) errors.category = 'Choose a category.';
  if (!values.account) errors.account = 'Choose an account.';
  if (!values.date) errors.date = 'Choose a date.';
  if (values.attachment && !/^https?:\/\//i.test(values.attachment.trim())) {
    errors.attachment = 'Use an http(s) link or leave this blank.';
  }
  if (values.isRecurring && !values.frequency) errors.frequency = 'Choose a frequency.';
  if (values.endDate && values.nextDate && values.endDate < values.nextDate) {
    errors.endDate = 'End date must be on or after the next date.';
  }
  return errors;
}

function payload(values) {
  const recurrence = values.isRecurring
    ? {
        frequency: values.frequency,
        ...(values.nextDate ? { nextDate: values.nextDate } : {}),
        ...(values.anchorDay ? { anchorDay: Number(values.anchorDay) } : {}),
        ...(values.endDate ? { endDate: values.endDate } : {}),
      }
    : null;

  return {
    type: values.type,
    amount: Number(values.amount),
    category: values.category,
    account: values.account,
    date: values.date,
    note: values.note.trim(),
    attachment: values.attachment.trim(),
    isRecurring: values.isRecurring,
    recurrence,
  };
}

export default function TransactionForm({
  initial,
  accounts = [],
  categories = { expense: [], income: [] },
  onSubmit,
  onCancel,
  submitting = false,
  error = '',
}) {
  const [values, setValues] = useState(() => initialState(initial));
  const [errors, setErrors] = useState({});
  const list = categories[values.type] || [];
  const categoryOptions = list.some((item) => item.name === values.category)
    ? list
    : [...list, ...(values.category ? [{ name: values.category, icon: '📦' }] : [])];

  const update = (key, value) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === 'type') next.category = '';
      return next;
    });
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(payload(values));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" required>
          {({ fieldId }) => (
            <Select id={fieldId} value={values.type} onChange={(event) => update('type', event.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          )}
        </Field>
        <Field label="Amount" required error={errors.amount}>
          {({ fieldId }) => (
            <Input id={fieldId} type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={values.amount} onChange={(event) => update('amount', event.target.value)} error={errors.amount} />
          )}
        </Field>
        <Field
          label="Category"
          required
          error={errors.category}
          hint={
            <Link to="/categories" className="text-teal-700 hover:underline dark:text-teal-300">
              Manage categories
            </Link>
          }
        >
          {({ fieldId }) => (
            <Select id={fieldId} value={values.category} onChange={(event) => update('category', event.target.value)} error={errors.category}>
              <option value="">Choose a category</option>
              {categoryOptions.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.icon} {item.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Account" required error={errors.account}>
          {({ fieldId }) => (
            <Select id={fieldId} value={values.account} onChange={(event) => update('account', event.target.value)} error={errors.account}>
              <option value="">Choose an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {currency(account.balance)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Date" required error={errors.date}>
          {({ fieldId }) => (
            <Input id={fieldId} type="date" value={values.date} onChange={(event) => update('date', event.target.value)} error={errors.date} />
          )}
        </Field>
        <Field label="Receipt link" error={errors.attachment} hint="Optional http(s) link">
          {({ fieldId }) => (
            <Input id={fieldId} type="url" placeholder="https://…" value={values.attachment} onChange={(event) => update('attachment', event.target.value)} error={errors.attachment} />
          )}
        </Field>
      </div>

      <Field label="Note" hint="Optional context for this transaction">
        {({ fieldId }) => (
          <Textarea id={fieldId} rows={2} maxLength={200} placeholder="What was this for?" value={values.note} onChange={(event) => update('note', event.target.value)} />
        )}
      </Field>

      <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 dark:border-slate-800">
        <input type="checkbox" checked={values.isRecurring} onChange={(event) => update('isRecurring', event.target.checked)} className="h-5 w-5 accent-teal-700" />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Repeat this transaction</span>
      </label>

      {values.isRecurring && <RecurringFields values={values} update={update} errors={errors} />}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initial ? 'Save changes' : 'Add transaction'}
        </Button>
      </div>
    </form>
  );
}

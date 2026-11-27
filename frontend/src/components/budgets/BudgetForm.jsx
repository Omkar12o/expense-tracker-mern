import { useState } from 'react';
import { currentMonth } from '../../utils/dates';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';

function validate(values) {
  const errors = {};
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(values.month)) {
    errors.month = 'Choose a valid month.';
  }
  const amount = Number(values.amount);
  if (!Number.isFinite(amount) || amount < 0.01) {
    errors.amount = 'Enter an amount of at least 0.01.';
  }
  return errors;
}

export default function BudgetForm({
  initial,
  categories = [],
  onSubmit,
  onCancel,
  submitting,
  error,
}) {
  const editing = Boolean(initial);
  const [values, setValues] = useState(() => ({
    month: initial?.month || currentMonth(),
    category: initial?.category || '',
    amount: initial ? String(initial.amount) : '',
  }));
  const [errors, setErrors] = useState({});

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      month: values.month,
      category: values.category || null,
      amount: Number(values.amount),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Month" required error={errors.month}>
          {({ fieldId }) => (
            <Input
              id={fieldId}
              type="month"
              value={values.month}
              onChange={update('month')}
              disabled={editing}
              error={errors.month}
            />
          )}
        </Field>
        <Field
          label="Category"
          hint="Leave blank for an overall monthly budget"
        >
          {({ fieldId }) => (
            <Select
              id={fieldId}
              value={values.category}
              onChange={update('category')}
              disabled={editing}
            >
              <option value="">Overall budget</option>
              {categories.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.icon} {item.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <Field label="Monthly limit" required error={errors.amount}>
        {({ fieldId }) => (
          <Input
            id={fieldId}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={values.amount}
            onChange={update('amount')}
            error={errors.amount}
          />
        )}
      </Field>

      {editing && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The month and category are locked while editing so the existing budget stays scoped correctly.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {editing ? 'Save budget' : 'Set budget'}
        </Button>
      </div>
    </form>
  );
}

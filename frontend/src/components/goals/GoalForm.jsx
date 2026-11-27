import { useState } from 'react';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import { Field, Input } from '../ui/Field';

function validate(values, editing) {
  const errors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'Goal name is required.';
  else if (name.length > 60) errors.name = 'Use 60 characters or fewer.';

  const target = Number(values.targetAmount);
  if (!Number.isFinite(target) || target < 0.01) {
    errors.targetAmount = 'Enter a target of at least 0.01.';
  }

  const current = Number(values.currentAmount || 0);
  if (!editing && (!Number.isFinite(current) || current < 0)) {
    errors.currentAmount = 'Enter zero or a positive amount.';
  }

  if (values.targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.targetDate)) {
    errors.targetDate = 'Choose a valid date.';
  }
  return errors;
}

export default function GoalForm({ initial, onSubmit, onCancel, submitting, error }) {
  const editing = Boolean(initial);
  const [values, setValues] = useState(() => ({
    name: initial?.name || '',
    targetAmount: initial ? String(initial.targetAmount) : '',
    currentAmount: initial ? String(initial.currentAmount ?? 0) : '0',
    targetDate: initial?.targetDate || '',
  }));
  const [errors, setErrors] = useState({});

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values, editing);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: values.name.trim(),
      targetAmount: Number(values.targetAmount),
      targetDate: values.targetDate || null,
    };
    if (!editing) payload.currentAmount = Number(values.currentAmount || 0);
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <Field label="Goal name" required error={errors.name}>
        {({ fieldId }) => (
          <Input
            id={fieldId}
            value={values.name}
            onChange={update('name')}
            placeholder="e.g. Emergency fund"
            maxLength={60}
            error={errors.name}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target amount" required error={errors.targetAmount}>
          {({ fieldId }) => (
            <Input
              id={fieldId}
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={values.targetAmount}
              onChange={update('targetAmount')}
              error={errors.targetAmount}
            />
          )}
        </Field>
        {!editing && (
          <Field label="Already saved" error={errors.currentAmount}>
            {({ fieldId }) => (
              <Input
                id={fieldId}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={values.currentAmount}
                onChange={update('currentAmount')}
                error={errors.currentAmount}
              />
            )}
          </Field>
        )}
        <Field label="Target date" error={errors.targetDate} hint="Optional">
          {({ fieldId }) => (
            <Input
              id={fieldId}
              type="date"
              value={values.targetDate}
              onChange={update('targetDate')}
              error={errors.targetDate}
            />
          )}
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {editing ? 'Save changes' : 'Create goal'}
        </Button>
      </div>
    </form>
  );
}

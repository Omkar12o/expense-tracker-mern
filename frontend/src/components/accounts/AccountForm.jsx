import { useState } from 'react';
import { ACCOUNT_TYPES } from '../../utils/constants';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';

function validate(values) {
  const errors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'Account name is required.';
  else if (name.length > 40) errors.name = 'Use 40 characters or fewer.';
  const balance = Number(values.initialBalance || 0);
  if (!Number.isFinite(balance) || balance < 0) {
    errors.initialBalance = 'Enter zero or a positive amount.';
  }
  return errors;
}

export default function AccountForm({ initial, onSubmit, onCancel, submitting, error }) {
  const [values, setValues] = useState(() => ({
    name: initial?.name || '',
    type: initial?.type || 'Cash',
    initialBalance: initial ? String(initial.initialBalance ?? 0) : '0',
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
      name: values.name.trim(),
      type: values.type,
      initialBalance: Number(values.initialBalance || 0),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <Field label="Account name" required error={errors.name}>
        {({ fieldId }) => (
          <Input
            id={fieldId}
            value={values.name}
            onChange={update('name')}
            placeholder="e.g. Main bank"
            maxLength={40}
            error={errors.name}
          />
        )}
      </Field>

      <Field label="Account type" required>
        {({ fieldId }) => (
          <Select id={fieldId} value={values.type} onChange={update('type')}>
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        label="Initial balance"
        error={errors.initialBalance}
        hint={
          initial
            ? 'Changing this recalculates your account balance from its transactions.'
            : 'Use zero if this is a new empty account.'
        }
      >
        {({ fieldId }) => (
          <Input
            id={fieldId}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.initialBalance}
            onChange={update('initialBalance')}
            error={errors.initialBalance}
          />
        )}
      </Field>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initial ? 'Save changes' : 'Add account'}
        </Button>
      </div>
    </form>
  );
}

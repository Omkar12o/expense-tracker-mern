import { useState } from 'react';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import { Field, Input } from '../ui/Field';

export default function ContributionForm({ goal, mode, onSubmit, onCancel, submitting, error }) {
  const [value, setValue] = useState('');
  const [fieldError, setFieldError] = useState('');
  const withdrawing = mode === 'withdraw';

  function handleSubmit(event) {
    event.preventDefault();
    const amount = Number(value);
    if (!Number.isFinite(amount) || Math.abs(amount) < 0.01) {
      setFieldError('Enter an amount of at least 0.01.');
      return;
    }
    setFieldError('');
    onSubmit(withdrawing ? -Math.abs(amount) : amount);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {goal?.name ? `${goal.name} · ` : ''}
        {withdrawing
          ? 'Move money out of this goal. Savings cannot go below zero.'
          : 'Record money you have set aside for this goal.'}
      </p>
      <Field label="Amount" required error={fieldError}>
        {({ fieldId }) => (
          <Input
            id={fieldId}
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            min={withdrawing ? undefined : '0.01'}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setFieldError('');
            }}
            error={fieldError}
          />
        )}
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant={withdrawing ? 'danger' : 'primary'} loading={submitting}>
          {withdrawing ? 'Withdraw' : 'Add savings'}
        </Button>
      </div>
    </form>
  );
}

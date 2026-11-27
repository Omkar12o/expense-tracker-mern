import { useState } from 'react';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';

function validate(values) {
  const errors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'Category name is required.';
  else if (name.length > 30) errors.name = 'Use 30 characters or fewer.';
  if (values.icon && values.icon.length > 16) errors.icon = 'Use 16 characters or fewer.';
  return errors;
}

export default function CategoryForm({ onSubmit, onCancel, submitting, error }) {
  const [values, setValues] = useState({ name: '', type: 'expense', icon: '📦' });
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
      icon: values.icon.trim() || '📦',
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <Field label="Category name" required error={errors.name}>
        {({ fieldId }) => (
          <Input
            id={fieldId}
            value={values.name}
            onChange={update('name')}
            placeholder="e.g. Coffee"
            maxLength={30}
            error={errors.name}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" required>
          {({ fieldId }) => (
            <Select id={fieldId} value={values.type} onChange={update('type')}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          )}
        </Field>
        <Field label="Icon" error={errors.icon} hint="An emoji or short symbol">
          {({ fieldId }) => (
            <Input
              id={fieldId}
              value={values.icon}
              onChange={update('icon')}
              maxLength={16}
              error={errors.icon}
            />
          )}
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Add category
        </Button>
      </div>
    </form>
  );
}

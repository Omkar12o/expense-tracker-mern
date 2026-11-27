import { Field, Input, Select } from '../ui/Field';

const frequencies = ['daily', 'weekly', 'monthly', 'yearly'];

export default function RecurringFields({ values, update, errors = {} }) {
  return (
    <fieldset className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 dark:bg-slate-800/50">
      <legend className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        Repeat settings
      </legend>
      <Field label="Frequency" required error={errors.frequency}>
        {({ fieldId }) => (
          <Select id={fieldId} value={values.frequency} onChange={(event) => update('frequency', event.target.value)}>
            {frequencies.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency[0].toUpperCase() + frequency.slice(1)}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Next due date" hint="Leave blank to calculate automatically">
        {({ fieldId }) => (
          <Input id={fieldId} type="date" value={values.nextDate} onChange={(event) => update('nextDate', event.target.value)} />
        )}
      </Field>
      <Field label="Anchor day" hint="Optional day of month for monthly/yearly">
        {({ fieldId }) => (
          <Input id={fieldId} type="number" min="1" max="31" value={values.anchorDay} onChange={(event) => update('anchorDay', event.target.value)} />
        )}
      </Field>
      <Field label="End date" error={errors.endDate}>
        {({ fieldId }) => (
          <Input id={fieldId} type="date" value={values.endDate} onChange={(event) => update('endDate', event.target.value)} error={errors.endDate} />
        )}
      </Field>
    </fieldset>
  );
}

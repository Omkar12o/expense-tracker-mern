import { Field, Select } from '../ui/Field';

const ranges = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: '3months', label: 'Last 3 months' },
  { value: 'year', label: 'Last 12 months' },
];

export default function AnalyticsControls({ range, onChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
          Insights
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Analytics
        </h2>
      </div>
      <div className="w-full sm:w-56">
        <Field label="Date range">
          {({ fieldId }) => (
            <Select id={fieldId} value={range} onChange={(event) => onChange(event.target.value)}>
              {ranges.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
    </div>
  );
}

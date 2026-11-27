import { currency } from '../../utils/format';

export default function TransactionSummary({ summary = {} }) {
  const items = [
    { label: 'Income', value: currency(summary.income || 0), tone: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Expenses', value: currency(summary.expense || 0), tone: 'text-rose-700 dark:text-rose-400' },
    { label: 'Net', value: currency(summary.net || 0), tone: 'text-slate-900 dark:text-slate-100' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {item.label}
          </p>
          <p className={`mt-1 text-xl font-bold ${item.tone}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

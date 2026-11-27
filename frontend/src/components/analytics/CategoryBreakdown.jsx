import { currency, percent } from '../../utils/format';
import EmptyState from '../ui/EmptyState';
import ProgressBar from '../ui/ProgressBar';

export default function CategoryBreakdown({ title, items = [], emptyLabel }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {items.length === 0 ? (
        <EmptyState icon="📊" title={emptyLabel} description="This range has no records yet." />
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((item) => (
            <li key={item.category}>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800"
                  aria-hidden="true"
                >
                  {item.icon || '📦'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {item.category}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {currency(item.amount)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={item.percent} label={percent(item.percent)} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

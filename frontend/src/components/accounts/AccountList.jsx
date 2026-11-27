import { currency } from '../../utils/format';
import Icon from '../ui/Icon';

function Balance({ label, value, tone = '' }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{currency(value)}</p>
    </div>
  );
}

function AccountCard({ item, onEdit, onDelete }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
            {item.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.type}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.name} account`}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Icon name="edit" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            aria-label={`Delete ${item.name} account`}
            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Balance label="Balance" value={item.balance} />
        <Balance label="Income" value={item.income} tone="text-emerald-700 dark:text-emerald-400" />
        <Balance label="Expense" value={item.expense} tone="text-rose-700 dark:text-rose-400" />
      </div>
    </li>
  );
}

export default function AccountList({ items = [], onEdit, onDelete }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <AccountCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}

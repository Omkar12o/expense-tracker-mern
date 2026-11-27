import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dates';
import { signedCurrency } from '../../utils/format';
import EmptyState from '../ui/EmptyState';
import Icon from '../ui/Icon';

export default function RecentTransactions({ items = [] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="🧾"
        title="No recent activity"
        description="Transactions you add will show up here."
        actionLabel="Add a transaction"
        to="/transactions"
      />
    );
  }

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800" aria-hidden="true">
            {item.categoryIcon || (item.type === 'income' ? '💰' : '📦')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {item.category}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {formatDate(item.date)} · {item.account?.name || 'Unknown account'}
            </p>
          </div>
          <span
            className={`shrink-0 text-sm font-semibold ${
              item.type === 'income'
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {signedCurrency(item.type, item.amount)}
          </span>
        </li>
      ))}
      <li className="pt-4">
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
        >
          View all transactions
          <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      </li>
    </ul>
  );
}

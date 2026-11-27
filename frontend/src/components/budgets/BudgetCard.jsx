import { formatMonth } from '../../utils/dates';
import { currency } from '../../utils/format';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import ProgressBar from '../ui/ProgressBar';

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const title = budget.category || 'Overall budget';

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            {budget.inherited && <Badge tone="info">Inherited from {formatMonth(budget.sourceMonth)}</Badge>}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formatMonth(budget.month)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            aria-label={`Edit ${title} budget`}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Icon name="edit" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget)}
            aria-label={`Delete ${title} budget`}
            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <ProgressBar
          value={budget.percentUsed}
          level={budget.level}
          label={`${currency(budget.spent)} of ${currency(budget.amount)}`}
        />
        <p className="text-sm text-slate-700 dark:text-slate-200">{budget.message}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currency(budget.remaining)} remaining
          </p>
          <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
            Update
          </Button>
        </div>
      </div>
    </li>
  );
}

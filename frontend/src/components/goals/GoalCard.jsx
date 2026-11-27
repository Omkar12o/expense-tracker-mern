import { formatDate } from '../../utils/dates';
import { currency, percent } from '../../utils/format';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import ProgressBar from '../ui/ProgressBar';

export default function GoalCard({ goal, onContribute, onWithdraw, onEdit, onDelete }) {
  const progress = Number(goal.progress) || 0;

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
              {goal.name}
            </h3>
            {goal.completed && <Badge tone="success">Completed</Badge>}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {goal.targetDate ? `Target ${formatDate(goal.targetDate)}` : 'No target date'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            aria-label={`Edit ${goal.name} goal`}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Icon name="edit" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal)}
            aria-label={`Delete ${goal.name} goal`}
            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <ProgressBar value={progress} label={`${currency(goal.currentAmount)} of ${currency(goal.targetAmount)}`} />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {percent(progress)} complete · {currency(Math.max(0, goal.targetAmount - goal.currentAmount))} to go
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onContribute(goal)}>
            Add savings
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onWithdraw(goal)}>
            Withdraw
          </Button>
        </div>
      </div>
    </li>
  );
}

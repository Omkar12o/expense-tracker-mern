import { budgetTones } from './Badge';

const colors = {
  success: 'bg-emerald-600 dark:bg-emerald-500',
  warning: 'bg-amber-500 dark:bg-amber-400',
  danger: 'bg-rose-600 dark:bg-rose-500',
};

export default function ProgressBar({ value = 0, level = 'ok', label = 'Progress', showLabel = true }) {
  const clamped = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const color = colors[budgetTones[level] || 'success'];

  return (
    <div>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
      >
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

const tones = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
};

export const budgetTones = {
  ok: 'success',
  warning: 'warning',
  high: 'warning',
  critical: 'danger',
  exceeded: 'danger',
};

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

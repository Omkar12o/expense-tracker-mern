import { currency, percent } from '../../utils/format';
import StatCard from '../dashboard/StatCard';

export default function AnalyticsSummary({ summary = {}, currentMonth = {} }) {
  const savingsRate = Number(summary.savingsRate) || 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Income" value={currency(summary.income)} icon="arrowUp" tone="emerald" />
      <StatCard label="Expenses" value={currency(summary.expense)} icon="arrowDown" tone="rose" />
      <StatCard
        label="Net change"
        value={currency(summary.net)}
        hint={`This month: ${currency(currentMonth.net)}`}
        icon="chart"
        tone="teal"
      />
      <StatCard
        label="Savings rate"
        value={percent(savingsRate)}
        hint="Net divided by income"
        icon="target"
        tone="sky"
      />
    </div>
  );
}

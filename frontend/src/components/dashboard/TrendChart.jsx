import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { compactCurrency, currency } from '../../utils/format';

function tickLabel(key) {
  return key.length === 7 ? key.slice(2) : key.slice(5);
}

export default function TrendChart({ data = [] }) {
  return (
    <div
      role="img"
      aria-label="Income and expense trend over the selected months"
      className="h-[280px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11d48" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
          <XAxis dataKey="key" tickFormatter={tickLabel} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={compactCurrency} fontSize={11} tickLine={false} axisLine={false} width={58} />
          <Tooltip
            formatter={(value, name) => [currency(value), name === 'income' ? 'Income' : 'Expense']}
            labelFormatter={(label) => label}
            contentStyle={{ borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 12 }}
          />
          <Legend formatter={(value) => (value === 'income' ? 'Income' : 'Expense')} />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#0d9488"
            strokeWidth={2}
            fill="url(#incomeFill)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#e11d48"
            strokeWidth={2}
            fill="url(#expenseFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

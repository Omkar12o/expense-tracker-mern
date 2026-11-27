import { dashboardApi } from '../api/dashboard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import StatCard from '../components/dashboard/StatCard';
import TrendChart from '../components/dashboard/TrendChart';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import ProgressBar from '../components/ui/ProgressBar';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import { useFetch } from '../hooks/useFetch';
import { formatMonth } from '../utils/dates';
import { currency } from '../utils/format';

export default function DashboardPage() {
  const { data, loading, error, refetch } = useFetch(() => dashboardApi.get(), []);

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A live snapshot of your income, spending, budgets and recent activity."
        actions={
          <Button as="link" to="/transactions">
            <Icon name="plus" className="h-4 w-4" />
            Manage transactions
          </Button>
        }
      />

      {loading && (
        <Card>
          <CardBody>
            <LoadingState rows={5} />
          </CardBody>
        </Card>
      )}

      {error && (
        <Card>
          <CardBody>
            <ErrorState message={error} onRetry={refetch} title="Dashboard unavailable" />
          </CardBody>
        </Card>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total balance" value={currency(data.totals.balance)} icon="wallet" tone="teal" />
            <StatCard label="All-time income" value={currency(data.totals.income)} icon="arrowUp" tone="emerald" />
            <StatCard label="All-time expenses" value={currency(data.totals.expense)} icon="arrowDown" tone="rose" />
            <StatCard
              label={formatMonth(data.currentMonth.month)}
              value={currency(data.currentMonth.net)}
              hint={`${currency(data.currentMonth.income)} in · ${currency(data.currentMonth.expense)} out`}
              icon="calendar"
              tone="sky"
            />
          </div>

          {data.totals.income === 0 && data.totals.expense === 0 && (
            <Card>
              <EmptyState
                icon="🚀"
                title="Start with your first transaction"
                description="Add income or an expense to unlock your personalised dashboard."
                actionLabel="Add a transaction"
                to="/transactions"
              />
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Six-month trend" description="Income and expenses from your records" />
              <CardBody>
                <TrendChart data={data.trend} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Monthly budget" description={formatMonth(data.currentMonth.month)} />
              <CardBody>
                {data.budget ? (
                  <div className="space-y-5">
                    <ProgressBar
                      value={data.budget.percentUsed}
                      level={data.budget.level}
                      label={`${currency(data.budget.spent)} of ${currency(data.budget.amount)}`}
                    />
                    <p className="text-sm text-slate-600 dark:text-slate-300">{data.budget.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currency(data.budget.remaining)} remaining
                    </p>
                  </div>
                ) : (
                  <EmptyState
                    icon="🎯"
                    title="No budget set"
                    description="Set a monthly limit to track your progress."
                    actionLabel="Set a budget"
                    to="/budgets"
                  />
                )}
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Recent transactions" description="Your latest eight records" />
              <CardBody>
                <RecentTransactions items={data.recentTransactions} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Accounts" description={`Combined balance ${currency(data.accounts.total)}`} />
              <CardBody>
                <ul className="space-y-3">
                  {data.accounts.items.map((account) => (
                    <li key={account.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-800 dark:text-slate-200">
                          {account.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{account.type}</span>
                      </span>
                      <span className="shrink-0 font-semibold text-slate-900 dark:text-slate-100">
                        {currency(account.balance)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

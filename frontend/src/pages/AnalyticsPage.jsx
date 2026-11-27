import { useState } from 'react';
import { analyticsApi } from '../api/analytics';
import AnalyticsControls from '../components/analytics/AnalyticsControls';
import AnalyticsSummary from '../components/analytics/AnalyticsSummary';
import CategoryBreakdown from '../components/analytics/CategoryBreakdown';
import TrendChart from '../components/dashboard/TrendChart';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import { useFetch } from '../hooks/useFetch';
import { formatDate } from '../utils/dates';

export default function AnalyticsPage() {
  const [range, setRange] = useState('month');
  const { data, loading, error, refetch } = useFetch(() => analyticsApi.get(range), [range]);

  const header = (
    <PageHeader
      eyebrow="Reports"
      title="Analytics"
      description="Every figure below is calculated from your own transactions."
    />
  );

  if (loading) {
    return (
      <>
        {header}
        <Card><CardBody><LoadingState rows={6} /></CardBody></Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        {header}
        <Card>
          <CardBody>
            <ErrorState title="Analytics unavailable" message={error} onRetry={refetch} />
          </CardBody>
        </Card>
      </>
    );
  }

  const hasData =
    data.trend.some((item) => item.income > 0 || item.expense > 0) ||
    data.expenseByCategory.length > 0 ||
    data.incomeByCategory.length > 0;

  return (
    <>
      {header}
      <div className="space-y-6">
        <Card>
          <CardBody>
            <AnalyticsControls range={range} onChange={setRange} />
          </CardBody>
        </Card>

        {!hasData ? (
          <Card>
            <EmptyState
              icon="📈"
              title="No analytics yet"
              description="Add income or expenses to unlock your personalised reports."
              actionLabel="Add a transaction"
              to="/transactions"
            />
          </Card>
        ) : (
          <>
            <AnalyticsSummary summary={data.summary} currentMonth={data.currentMonth} />

            <Card>
              <CardHeader
                title="Income vs expenses"
                description={`${formatDate(data.start)} to ${formatDate(data.end)}`}
              />
              <CardBody>
                <TrendChart data={data.trend} />
              </CardBody>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <CategoryBreakdown
                title="Expense categories"
                items={data.expenseByCategory}
                emptyLabel="No expenses in this range"
              />
              <CategoryBreakdown
                title="Income categories"
                items={data.incomeByCategory}
                emptyLabel="No income in this range"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

import { useState } from 'react';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetForm from '../components/budgets/BudgetForm';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Icon from '../components/ui/Icon';
import LoadingState from '../components/ui/LoadingState';
import Modal from '../components/ui/Modal';
import { useBudgetsController } from '../hooks/useBudgetsController';
import { currentMonth } from '../utils/dates';
import { currency } from '../utils/format';

export default function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth());
  const page = useBudgetsController(month);
  const {
    budgets,
    categories,
    formOpen,
    setFormOpen,
    editing,
    formError,
    saving,
    deleting,
    setDeleting,
    deleteBusy,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
    retry,
  } = page;

  const header = (
    <PageHeader
      eyebrow="Spending limits"
      title="Budgets"
      description="Set monthly limits for overall spending or individual categories."
      actions={
        <Button onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Set budget
        </Button>
      }
    />
  );

  if (budgets.loading || categories.loading) {
    return (
      <>
        {header}
        <Card><CardBody><LoadingState rows={4} /></CardBody></Card>
      </>
    );
  }

  if (budgets.error || categories.error) {
    return (
      <>
        {header}
        <Card>
          <CardBody>
            <ErrorState
              title="Budgets unavailable"
              message={budgets.error || categories.error}
              onRetry={retry}
            />
          </CardBody>
        </Card>
      </>
    );
  }

  const items = [
    ...(budgets.data?.overall ? [budgets.data.overall] : []),
    ...(budgets.data?.categories || []),
  ];

  return (
    <>
      {header}
      <div className="space-y-6">
        <Card>
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Month</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                {currency(budgets.data?.totalSpent || 0)} spent
              </p>
            </div>
            <div className="w-full sm:w-56">
              <label htmlFor="budget-month" className="sr-only">
                Budget month
              </label>
              <input
                id="budget-month"
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value || currentMonth())}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </CardBody>
        </Card>

        {items.length === 0 ? (
          <Card>
            <EmptyState
              icon="🎯"
              title="No budgets set"
              description="Create an overall or category budget for this month."
              actionLabel="Set a budget"
              onAction={openCreate}
            />
          </Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <BudgetCard key={item.id} budget={item} onEdit={openEdit} onDelete={setDeleting} />
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Update budget' : 'Set budget'}
        description="Budgets repeat automatically until you change or delete them."
      >
        <BudgetForm
          key={editing?.id || 'new'}
          initial={editing}
          categories={categories.data || []}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitting={saving}
          error={formError}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this budget?"
        description={`${deleting?.category || 'This overall'} budget will be removed.`}
        confirmLabel="Delete"
        destructive
        loading={deleteBusy}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

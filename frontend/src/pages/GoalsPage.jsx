import ContributionForm from '../components/goals/ContributionForm';
import GoalCard from '../components/goals/GoalCard';
import GoalForm from '../components/goals/GoalForm';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Icon from '../components/ui/Icon';
import LoadingState from '../components/ui/LoadingState';
import Modal from '../components/ui/Modal';
import { useGoalsController } from '../hooks/useGoalsController';
import { currency } from '../utils/format';

export default function GoalsPage() {
  const page = useGoalsController();
  const {
    list,
    formOpen,
    setFormOpen,
    editing,
    contribution,
    contributionMode,
    setContribution,
    dialogError,
    busy,
    deleting,
    setDeleting,
    deleteBusy,
    openCreate,
    openEdit,
    openContribution,
    handleSave,
    handleContribution,
    handleDelete,
  } = page;

  const header = (
    <PageHeader
      eyebrow="Savings"
      title="Goals"
      description="Set a target and track every contribution toward it."
      actions={
        <Button onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Add goal
        </Button>
      }
    />
  );

  if (list.loading) {
    return (
      <>
        {header}
        <Card><CardBody><LoadingState rows={4} /></CardBody></Card>
      </>
    );
  }

  if (list.error) {
    return (
      <>
        {header}
        <Card>
          <CardBody>
            <ErrorState title="Goals unavailable" message={list.error} onRetry={list.refetch} />
          </CardBody>
        </Card>
      </>
    );
  }

  const items = list.data || [];
  const saved = items.reduce((sum, item) => sum + Number(item.currentAmount || 0), 0);
  const targets = items.reduce((sum, item) => sum + Number(item.targetAmount || 0), 0);
  const completed = items.filter((item) => item.completed).length;

  return (
    <>
      {header}
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardBody><p className="text-sm text-slate-500 dark:text-slate-400">Total saved</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{currency(saved)}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-slate-500 dark:text-slate-400">Combined target</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{currency(targets)}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-slate-500 dark:text-slate-400">Completed</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{completed} of {items.length}</p></CardBody></Card>
        </div>

        {items.length === 0 ? (
          <Card>
            <EmptyState
              icon="🏆"
              title="No goals yet"
              description="Create a savings goal and start contributing."
              actionLabel="Add goal"
              onAction={openCreate}
            />
          </Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {items.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={(item) => openContribution(item, 'add')}
                onWithdraw={(item) => openContribution(item, 'withdraw')}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit goal' : 'Add goal'}
        description="Targets and savings are stored with two decimal places."
      >
        <GoalForm
          key={editing?.id || 'new'}
          initial={editing}
          onSubmit={handleSave}
          onCancel={() => setFormOpen(false)}
          submitting={busy}
          error={dialogError}
        />
      </Modal>

      <Modal
        open={Boolean(contribution)}
        onClose={() => setContribution(null)}
        title={contributionMode === 'withdraw' ? 'Withdraw savings' : 'Add savings'}
        description="Your goal progress updates immediately."
      >
        <ContributionForm
          goal={contribution}
          mode={contributionMode}
          onSubmit={handleContribution}
          onCancel={() => setContribution(null)}
          submitting={busy}
          error={dialogError}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this goal?"
        description={`${deleting?.name || 'This goal'} and its progress will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        loading={deleteBusy}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

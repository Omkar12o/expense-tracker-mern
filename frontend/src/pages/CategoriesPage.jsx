import CategoryForm from '../components/categories/CategoryForm';
import CategoryGroup from '../components/categories/CategoryGroup';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Icon from '../components/ui/Icon';
import LoadingState from '../components/ui/LoadingState';
import Modal from '../components/ui/Modal';
import { useCategoriesController } from '../hooks/useCategoriesController';

export default function CategoriesPage() {
  const page = useCategoriesController();
  const {
    list,
    formOpen,
    setFormOpen,
    formError,
    saving,
    deleting,
    setDeleting,
    deleteBusy,
    handleSubmit,
    handleDelete,
  } = page;

  const header = (
    <PageHeader
      eyebrow="Organisation"
      title="Categories"
      description="Built-in categories cover the basics; add your own for everything else."
      actions={
        <Button onClick={() => setFormOpen(true)}>
          <Icon name="plus" className="h-4 w-4" />
          Add category
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
            <ErrorState title="Categories unavailable" message={list.error} onRetry={list.refetch} />
          </CardBody>
        </Card>
      </>
    );
  }

  const expense = list.data?.expense || [];
  const income = list.data?.income || [];
  const isEmpty = expense.length === 0 && income.length === 0;

  return (
    <>
      {header}
      {isEmpty ? (
        <Card>
          <EmptyState
            icon="🏷️"
            title="No categories found"
            description="Add a category to start organising your transactions."
            actionLabel="Add category"
            onAction={() => setFormOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryGroup title="Expense categories" items={expense} onDelete={setDeleting} />
          <CategoryGroup title="Income categories" items={income} onDelete={setDeleting} />
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add category"
        description="Custom categories appear alongside the built-in ones."
      >
        <CategoryForm
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitting={saving}
          error={formError}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this category?"
        description={`${deleting?.name || 'This category'} can only be deleted when no transactions use it.`}
        confirmLabel="Delete"
        destructive
        loading={deleteBusy}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

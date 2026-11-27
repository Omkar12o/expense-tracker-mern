import { useState } from 'react';
import { budgetsApi } from '../api/budgets';
import { categoriesApi } from '../api/categories';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useFetch } from './useFetch';

export function useBudgetsController(month) {
  const toast = useToast();
  const budgets = useFetch(() => budgetsApi.list(month), [month]);
  const categories = useFetch(async () => {
    const result = await categoriesApi.list();
    return result.expense || [];
  }, []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (budget) => {
    setEditing(budget);
    setFormError('');
    setFormOpen(true);
  };

  async function handleSubmit(payload) {
    setSaving(true);
    setFormError('');
    try {
      await budgetsApi.set(payload);
      toast.success(editing ? 'Budget updated' : 'Budget saved');
      setFormOpen(false);
      setEditing(null);
      budgets.refetch();
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error('Could not save budget', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await budgetsApi.remove(deleting.id);
      toast.success('Budget deleted');
      setDeleting(null);
      budgets.refetch();
    } catch (error) {
      toast.error('Could not delete budget', errorMessage(error));
    } finally {
      setDeleteBusy(false);
    }
  }

  const retry = () => {
    budgets.refetch();
    categories.refetch();
  };

  return {
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
  };
}

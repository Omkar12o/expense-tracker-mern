import { useState } from 'react';
import { categoriesApi } from '../api/categories';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useFetch } from './useFetch';

export function useCategoriesController() {
  const toast = useToast();
  const list = useFetch(() => categoriesApi.list(), []);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function handleSubmit(payload) {
    setSaving(true);
    setFormError('');
    try {
      await categoriesApi.create(payload);
      toast.success('Category added', `${payload.name} is ready to use.`);
      setFormOpen(false);
      list.refetch();
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error('Could not add category', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await categoriesApi.remove(deleting.id);
      toast.success('Category deleted');
      setDeleting(null);
      list.refetch();
    } catch (error) {
      toast.error('Could not delete category', errorMessage(error));
    } finally {
      setDeleteBusy(false);
    }
  }

  return {
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
  };
}

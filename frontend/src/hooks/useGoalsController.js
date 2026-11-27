import { useState } from 'react';
import { errorMessage } from '../api/client';
import { goalsApi } from '../api/goals';
import { useToast } from '../context/ToastContext';
import { useFetch } from './useFetch';

export function useGoalsController() {
  const toast = useToast();
  const list = useFetch(() => goalsApi.list(), []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [contribution, setContribution] = useState(null);
  const [contributionMode, setContributionMode] = useState('add');
  const [dialogError, setDialogError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setDialogError('');
    setFormOpen(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setDialogError('');
    setFormOpen(true);
  };

  const openContribution = (goal, mode = 'add') => {
    setContribution(goal);
    setContributionMode(mode);
    setDialogError('');
  };

  async function handleSave(payload) {
    setBusy(true);
    setDialogError('');
    try {
      if (editing) await goalsApi.update(editing.id, payload);
      else await goalsApi.create(payload);
      toast.success(editing ? 'Goal updated' : 'Goal created');
      setFormOpen(false);
      setEditing(null);
      list.refetch();
    } catch (error) {
      const message = errorMessage(error);
      setDialogError(message);
      toast.error('Could not save goal', message);
    } finally {
      setBusy(false);
    }
  }

  async function handleContribution(amount) {
    if (!contribution) return;
    setBusy(true);
    setDialogError('');
    try {
      await goalsApi.contribute(contribution.id, amount);
      toast.success(amount < 0 ? 'Withdrawal saved' : 'Savings added');
      setContribution(null);
      list.refetch();
    } catch (error) {
      const message = errorMessage(error);
      setDialogError(message);
      toast.error('Could not update goal', message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await goalsApi.remove(deleting.id);
      toast.success('Goal deleted');
      setDeleting(null);
      list.refetch();
    } catch (error) {
      toast.error('Could not delete goal', errorMessage(error));
    } finally {
      setDeleteBusy(false);
    }
  }

  return {
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
  };
}

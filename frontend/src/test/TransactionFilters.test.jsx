import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import TransactionFilters from '../components/transactions/TransactionFilters';
import { useTransactionFilters } from '../hooks/useTransactionFilters';

function Harness() {
  const { filters, update, reset } = useTransactionFilters();
  return <TransactionFilters filters={filters} update={update} reset={reset} />;
}

describe('Transaction recurrence filters', () => {
  it('maps the selection into API params and clears it on reset', () => {
    const { result } = renderHook(() => useTransactionFilters());

    act(() => result.current.update('recurring', 'true'));
    expect(result.current.params).toMatchObject({ recurring: 'true' });

    act(() => result.current.reset());
    expect(result.current.params.recurring).toBeUndefined();
  });

  it('exposes an accessible recurrence selector', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const select = screen.getByLabelText('Recurrence');
    await user.selectOptions(select, 'false');

    expect(select).toHaveValue('false');
    expect(screen.getByRole('option', { name: 'Recurring only' })).toHaveValue('true');
  });
});

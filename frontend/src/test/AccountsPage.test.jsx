import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccountsPage from '../pages/AccountsPage';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../api/accounts', () => ({
  accountsApi: { list: mocks.list, create: mocks.create, update: mocks.update, remove: mocks.remove },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ success: mocks.success, error: mocks.error, info: vi.fn(), warning: vi.fn() }),
}));

const accounts = {
  data: {
    items: [
      { id: 'acc-1', name: 'Cash', type: 'Cash', initialBalance: 100, income: 50, expense: 20, balance: 130 },
    ],
    total: 130,
  },
};

describe('AccountsPage', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.list.mockResolvedValue(accounts);
  });

  it('renders live balances and account actions', async () => {
    render(<AccountsPage />);

    expect(await screen.findByRole('heading', { name: 'Cash' })).toBeInTheDocument();
    expect(screen.getAllByText('$130.00').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Edit Cash account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Cash account' })).toBeInTheDocument();
  });

  it('creates an account from validated form input', async () => {
    const user = userEvent.setup();
    mocks.create.mockResolvedValue({ id: 'acc-2' });
    render(<AccountsPage />);

    await user.click((await screen.findAllByRole('button', { name: /add account/i }))[0]);
    const dialog = screen.getByRole('dialog');

    await user.type(within(dialog).getByLabelText(/account name/i), 'Main bank');
    await user.selectOptions(within(dialog).getByLabelText(/account type/i), 'Bank Account');
    await user.clear(within(dialog).getByLabelText(/initial balance/i));
    await user.type(within(dialog).getByLabelText(/initial balance/i), '250.50');
    await user.click(within(dialog).getByRole('button', { name: /add account/i }));

    await vi.waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith({
        name: 'Main bank',
        type: 'Bank Account',
        initialBalance: 250.5,
      }),
    );
  });

  it('shows an actionable error state when loading fails', async () => {
    mocks.list.mockRejectedValue({ appError: { message: 'Accounts offline' } });
    render(<AccountsPage />);

    expect(await screen.findByText('Accounts unavailable')).toBeInTheDocument();
    expect(screen.getByText('Accounts offline')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});

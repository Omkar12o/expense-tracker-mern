import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GoalsPage from '../pages/GoalsPage';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  contribute: vi.fn(),
  remove: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../api/goals', () => ({
  goalsApi: {
    list: mocks.list,
    create: mocks.create,
    update: mocks.update,
    contribute: mocks.contribute,
    remove: mocks.remove,
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ success: mocks.success, error: mocks.error, info: vi.fn(), warning: vi.fn() }),
}));

const goals = [
  {
    id: 'goal-1',
    name: 'Emergency fund',
    targetAmount: 1000,
    currentAmount: 250,
    targetDate: '2026-12-31',
    progress: 25,
    completed: false,
  },
];

describe('GoalsPage', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.list.mockResolvedValue(goals);
  });

  it('renders live goal progress from the API', async () => {
    render(<GoalsPage />);

    expect(await screen.findByText('Emergency fund')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /\$250.00 of \$1,000.00/ })).toHaveAttribute(
      'aria-valuenow',
      '25',
    );
    expect(screen.getByRole('button', { name: /add savings/i })).toBeInTheDocument();
  });

  it('records a contribution with a positive amount', async () => {
    const user = userEvent.setup();
    mocks.contribute.mockResolvedValue({ id: 'goal-1' });
    render(<GoalsPage />);

    await user.click((await screen.findAllByRole('button', { name: /add savings/i }))[0]);
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/amount/i), '50');
    await user.click(within(dialog).getByRole('button', { name: /add savings/i }));

    await vi.waitFor(() => expect(mocks.contribute).toHaveBeenCalledWith('goal-1', 50));
  });

  it('converts withdrawals to a negative API amount', async () => {
    const user = userEvent.setup();
    mocks.contribute.mockResolvedValue({ id: 'goal-1' });
    render(<GoalsPage />);

    await user.click(await screen.findByRole('button', { name: /withdraw/i }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/amount/i), '20');
    await user.click(within(dialog).getByRole('button', { name: /withdraw/i }));

    await vi.waitFor(() => expect(mocks.contribute).toHaveBeenCalledWith('goal-1', -20));
  });

  it('shows an empty state when no goals exist', async () => {
    mocks.list.mockResolvedValue([]);
    render(<GoalsPage />);

    expect(await screen.findByText('No goals yet')).toBeInTheDocument();
  });
});

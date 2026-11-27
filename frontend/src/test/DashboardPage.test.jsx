import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from '../pages/DashboardPage';

vi.mock('../components/dashboard/TrendChart', () => ({
  default: () => <div>Trend chart placeholder</div>,
}));

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('../api/dashboard', () => ({ dashboardApi: { get: mockGet } }));

const dashboard = {
  totals: { income: 500, expense: 40, balance: 460 },
  currentMonth: { month: '2026-11', income: 500, expense: 40, net: 460 },
  budget: {
    id: 'budget-1',
    amount: 100,
    spent: 40,
    remaining: 60,
    percentUsed: 40,
    level: 'ok',
    message: 'You have used 40% of your November budget.',
  },
  trend: [{ key: '2026-10', income: 100, expense: 20 }],
  recentTransactions: [
    {
      id: 'tx-1',
      type: 'expense',
      amount: 40,
      category: 'Food',
      categoryIcon: '🍔',
      date: '2026-11-27',
      account: { id: 'acc-1', name: 'Cash' },
    },
  ],
  accounts: {
    items: [{ id: 'acc-1', name: 'Cash', type: 'Cash', balance: 460 }],
    total: 460,
  },
};

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('renders live totals, budget state, trend and recent activity', async () => {
    mockGet.mockResolvedValue(dashboard);
    renderPage();

    expect(await screen.findByText('Total balance')).toBeInTheDocument();
    expect(screen.getAllByText('$460.00').length).toBeGreaterThan(0);
    expect(screen.getByText('You have used 40% of your November budget.')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getAllByText('Cash').length).toBeGreaterThan(0);
    expect(screen.getByText('Six-month trend')).toBeInTheDocument();
  });

  it('shows an actionable error state when the API fails', async () => {
    mockGet.mockRejectedValue({ appError: { message: 'Network down' } });
    renderPage();

    expect(await screen.findByText('Dashboard unavailable')).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('prompts a new user to add their first transaction', async () => {
    mockGet.mockResolvedValue({
      ...dashboard,
      totals: { income: 0, expense: 0, balance: 0 },
      currentMonth: { month: '2026-11', income: 0, expense: 0, net: 0 },
      budget: null,
      trend: [],
      recentTransactions: [],
    });
    renderPage();

    await waitFor(() => expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument());
    expect(await screen.findByText('Start with your first transaction')).toBeInTheDocument();
    expect(screen.getByText('No budget set')).toBeInTheDocument();
  });
});

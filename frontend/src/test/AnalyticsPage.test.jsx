import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AnalyticsPage from '../pages/AnalyticsPage';

vi.mock('../components/dashboard/TrendChart', () => ({
  default: () => <div>Trend chart placeholder</div>,
}));

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('../api/analytics', () => ({ analyticsApi: { get: mockGet } }));

const analytics = {
  range: 'month',
  unit: 'day',
  start: '2026-10-29',
  end: '2026-11-27',
  summary: { income: 1000, expense: 250, net: 750, savingsRate: 75 },
  trend: [{ key: '2026-11-27', income: 1000, expense: 250 }],
  expenseByCategory: [{ category: 'Food', amount: 250, percent: 100, icon: '🍔' }],
  incomeByCategory: [{ category: 'Salary', amount: 1000, percent: 100, icon: '💼' }],
  currentMonth: { month: '2026-11', income: 1000, expense: 250, net: 750 },
};

function renderPage() {
  return render(
    <MemoryRouter>
      <AnalyticsPage />
    </MemoryRouter>,
  );
}

describe('AnalyticsPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockGet.mockResolvedValue(analytics);
  });

  it('renders API-derived summary and category breakdowns', async () => {
    renderPage();

    expect(await screen.findByText('Income vs expenses')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith('month');
  });

  it('refetches analytics when the date range changes', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(await screen.findByLabelText('Date range'), 'year');

    await waitFor(() => expect(mockGet).toHaveBeenLastCalledWith('year'));
  });

  it('shows an actionable empty state when no data exists', async () => {
    mockGet.mockResolvedValue({
      ...analytics,
      summary: { income: 0, expense: 0, net: 0, savingsRate: 0 },
      trend: [],
      expenseByCategory: [],
      incomeByCategory: [],
    });
    renderPage();

    expect(await screen.findByText('No analytics yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add a transaction/i })).toBeInTheDocument();
  });
});

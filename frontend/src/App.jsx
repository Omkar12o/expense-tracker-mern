import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import PlaceholderPage from './pages/PlaceholderPage';

const screens = [
  {
    path: 'dashboard',
    title: 'Dashboard',
    description: 'Your financial snapshot at a glance.',
    icon: '📊',
    emptyTitle: 'Your dashboard is quiet',
    emptyDescription: 'Add your first transaction to see live totals and trends.',
  },
  {
    path: 'transactions',
    title: 'Transactions',
    description: 'Record, filter and export every income and expense.',
    icon: '🧾',
    emptyTitle: 'No transactions yet',
    emptyDescription: 'Your income and expenses will appear here once added.',
  },
  {
    path: 'analytics',
    title: 'Analytics',
    description: 'See where your money goes over time.',
    icon: '📈',
    emptyTitle: 'No analytics yet',
    emptyDescription: 'Analytics are calculated from your own transactions.',
  },
  {
    path: 'budgets',
    title: 'Budgets',
    description: 'Set monthly limits and track your progress.',
    icon: '🎯',
    emptyTitle: 'No budgets set',
    emptyDescription: 'Create a budget to keep your spending in check.',
  },
  {
    path: 'goals',
    title: 'Goals',
    description: 'Save steadily for the things that matter.',
    icon: '🏆',
    emptyTitle: 'No goals yet',
    emptyDescription: 'Create a savings goal and start contributing.',
  },
  {
    path: 'accounts',
    title: 'Accounts',
    description: 'Keep cash, bank and card balances in one place.',
    icon: '👛',
    emptyTitle: 'No accounts found',
    emptyDescription: 'Add an account to organise your transactions.',
  },
  {
    path: 'categories',
    title: 'Categories',
    description: 'Customise the labels you use every day.',
    icon: '🏷️',
    emptyTitle: 'No custom categories',
    emptyDescription: 'Built-in categories are ready to use; add your own anytime.',
  },
];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          {screens.map((screen) => (
            <Route
              key={screen.path}
              path={`/${screen.path}`}
              element={
                <PlaceholderPage
                  title={screen.title}
                  description={screen.description}
                  icon={screen.icon}
                  emptyTitle={screen.emptyTitle}
                  emptyDescription={screen.emptyDescription}
                />
              }
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

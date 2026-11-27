import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AccountsPage from './pages/AccountsPage';
import CategoriesPage from './pages/CategoriesPage';
import NotFoundPage from './pages/NotFoundPage';
import PlaceholderPage from './pages/PlaceholderPage';

const screens = [
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
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

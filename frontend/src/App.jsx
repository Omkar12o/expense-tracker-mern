import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import LoadingState from './components/ui/LoadingState';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AccountsPage = lazy(() => import('./pages/AccountsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 xl:pb-8">
      <LoadingState rows={4} />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

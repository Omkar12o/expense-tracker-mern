import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/ui/LoadingState';

export default function PublicOnlyRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <LoadingState label="Checking your session" rows={2} />
      </div>
    );
  }

  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

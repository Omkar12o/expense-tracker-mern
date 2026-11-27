import { useLocation } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import Alert from '../components/ui/Alert';

export default function LoginPage() {
  const location = useLocation();
  const sessionExpired = location.state?.sessionExpired;

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to pick up where you left off."
    >
      {sessionExpired && (
        <div className="mb-5">
          <Alert variant="warning" title="Your session ended">
            Please sign in again to continue securely.
          </Alert>
        </div>
      )}
      <LoginForm />
    </AuthLayout>
  );
}

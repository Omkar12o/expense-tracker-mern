import { useLocation } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import Alert from '../components/ui/Alert';

export default function LoginPage() {
  const location = useLocation();
  const sessionExpired = location.state?.sessionExpired;

  return (
    <AuthLayout
      eyebrow="Secure sign in"
      title="Welcome back"
      description="Sign in to see your dashboard, insights, and goals in one place."
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

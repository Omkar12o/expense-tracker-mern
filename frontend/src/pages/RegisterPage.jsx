import AuthLayout from '../components/auth/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Start tracking in under a minute. No credit card, no clutter."
    >
      <RegisterForm />
    </AuthLayout>
  );
}

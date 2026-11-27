import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import { Field, Input } from '../ui/Field';
import Icon from '../ui/Icon';

function validate(values) {
  const errors = {};
  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.password) errors.password = 'Password is required.';
  return errors;
}

export default function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFormError('');
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login({ email: values.email.trim().toLowerCase(), password: values.password });
      toast.success('Welcome back', 'You are signed in.');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error('Sign in failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && <Alert variant="error">{formError}</Alert>}

      <Field label="Email address" required error={errors.email}>
        {({ fieldId, describedBy }) => (
          <Input
            id={fieldId}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={update('email')}
            error={errors.email}
            aria-describedby={describedBy}
            disabled={submitting}
          />
        )}
      </Field>

      <Field label="Password" required error={errors.password}>
        {({ fieldId, describedBy }) => (
          <div className="relative">
            <Input
              id={fieldId}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              className="pr-12"
              value={values.password}
              onChange={update('password')}
              error={errors.password}
              aria-describedby={describedBy}
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-5 w-5" />
            </button>
          </div>
        )}
      </Field>

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        Sign in
      </Button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-300">
        New here?{' '}
        <Link to="/register" className="font-semibold text-teal-700 hover:underline dark:text-teal-300">
          Create an account
        </Link>
      </p>
    </form>
  );
}

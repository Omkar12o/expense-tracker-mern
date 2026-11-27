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
  if (!values.username.trim()) errors.username = 'Username is required.';
  if (!values.password) errors.password = 'Password is required.';
  return errors;
}

const inputClass =
  'h-12 rounded-2xl! border-slate-200! bg-slate-50/80! pl-11 pr-12 text-[15px] shadow-inner shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-950/60! dark:shadow-none';

export default function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ username: '', password: '' });
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
      await login({ username: values.username.trim().toLowerCase(), password: values.password });
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
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {formError && (
        <Alert variant="error" title="Sign in failed">
          {formError}
        </Alert>
      )}

      <div className="space-y-5">
        <Field
          label="Username"
          required
          error={errors.username}
          hint="You can also use your email address."
        >
          {({ fieldId, describedBy }) => (
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 dark:text-slate-500">
                <Icon name="user" className="h-5 w-5" />
              </span>
              <Input
                id={fieldId}
                name="username"
                type="text"
                autoComplete="username"
                placeholder="your_username"
                className={inputClass}
                value={values.username}
                onChange={update('username')}
                error={errors.username}
                aria-describedby={describedBy}
                disabled={submitting}
              />
            </div>
          )}
        </Field>

        <Field label="Password" required error={errors.password}>
          {({ fieldId, describedBy }) => (
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 dark:text-slate-500">
                <Icon name="lock" className="h-5 w-5" />
              </span>
              <Input
                id={fieldId}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                className={inputClass}
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
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-slate-400 transition-colors hover:text-teal-700 dark:text-slate-500 dark:hover:text-teal-300"
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-5 w-5" />
              </button>
            </div>
          )}
        </Field>
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={submitting}
        className="group h-12 rounded-2xl! bg-gradient-to-r from-teal-700 to-teal-600 shadow-lg! shadow-teal-900/15 hover:from-teal-800 hover:to-teal-700 dark:from-teal-600 dark:to-teal-500 dark:hover:from-teal-500 dark:hover:to-teal-400"
      >
        <span>Sign in</span>
        <Icon name="chevronRight" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            New to Expense Tracker?
          </span>
        </div>
      </div>

      <Link
        to="/register"
        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-800 dark:hover:bg-teal-950/40 dark:hover:text-teal-200"
      >
        <Icon name="spark" className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        Create your account
      </Link>
    </form>
  );
}

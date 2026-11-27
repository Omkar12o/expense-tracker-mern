import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import { Field, Input } from '../ui/Field';
import Icon from '../ui/Icon';

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!/^[a-z0-9_]{3,30}$/.test(values.username.trim().toLowerCase())) {
    errors.username = 'Use 3-30 letters, numbers or underscores.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/.test(values.password)) {
    errors.password = 'Use 8+ characters with at least one letter and one number.';
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

export default function RegisterForm() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
      await register({
        name: values.name.trim(),
        username: values.username.trim().toLowerCase(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      toast.success('Account created', 'Your workspace is ready.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error('Registration failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  const passwordProps = {
    type: showPassword ? 'text' : 'password',
    className: 'pr-12',
    autoComplete: 'new-password',
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && <Alert variant="error">{formError}</Alert>}

      <Field label="Full name" required error={errors.name}>
        {({ fieldId, describedBy }) => (
          <Input
            id={fieldId}
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={update('name')}
            error={errors.name}
            aria-describedby={describedBy}
            disabled={submitting}
          />
        )}
      </Field>

      <Field
        label="Username"
        required
        error={errors.username}
        hint="3-30 letters, numbers or underscores. This is how you sign in."
      >
        {({ fieldId, describedBy }) => (
          <Input
            id={fieldId}
            name="username"
            autoComplete="username"
            placeholder="your_username"
            value={values.username}
            onChange={update('username')}
            error={errors.username}
            aria-describedby={describedBy}
            disabled={submitting}
          />
        )}
      </Field>

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

      <Field
        label="Password"
        required
        error={errors.password}
        hint="At least 8 characters, including a letter and a number."
      >
        {({ fieldId, describedBy }) => (
          <div className="relative">
            <Input
              id={fieldId}
              name="password"
              value={values.password}
              onChange={update('password')}
              error={errors.password}
              aria-describedby={describedBy}
              disabled={submitting}
              {...passwordProps}
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

      <Field label="Confirm password" required error={errors.confirmPassword}>
        {({ fieldId, describedBy }) => (
          <Input
            id={fieldId}
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={update('confirmPassword')}
            error={errors.confirmPassword}
            aria-describedby={describedBy}
            disabled={submitting}
          />
        )}
      </Field>

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        Create account
      </Button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-teal-700 hover:underline dark:text-teal-300">
          Sign in
        </Link>
      </p>
    </form>
  );
}

import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/features/auth/useAuth';
import { getApiErrorMessage } from '@/lib/api/errors';

type AuthPageProps = {
  mode: 'login' | 'register';
};

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function AuthPage({ mode }: AuthPageProps) {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/rides';

  if (isAuthenticated) {
    return <Navigate to="/rides" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (mode === 'register' && (!form.firstName.trim() || !form.lastName.trim())) {
      setError('Enter your first and last name.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email,
          password: form.password
        });
      }
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
      <div>
        <p className="text-sm font-medium text-utsc-teal">UTSC students only</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {isLogin ? 'Welcome back.' : 'Start sharing rides around campus.'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in to browse rides, post a trip, request seats, and manage your own rides from one place.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{isLogin ? 'Log in' : 'Create account'}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {isLogin ? 'Use your account credentials.' : 'Create an account to continue.'}
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {error ? <Alert message={error} /> : null}

          {!isLogin ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                autoComplete="given-name"
              />
              <TextField
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                autoComplete="family-name"
              />
            </div>
          ) : null}

          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            autoComplete="email"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-utsc-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-600">
            {isLogin ? 'Need an account?' : 'Already have an account?'}{' '}
            <Link className="font-medium text-utsc-teal hover:text-teal-700" to={isLogin ? '/register' : '/login'}>
              {isLogin ? 'Create one' : 'Log in'}
            </Link>
          </p>
        </div>
      </form>
    </section>
  );
}

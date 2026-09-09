import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Lock, Mail, ScanLine, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import { fadeUp, pageTransition } from '../lib/motion';

const COPY = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Sign in to VeriPack',
    description: 'Your scans and compliance history, exactly where you left them.',
    submit: 'Sign in',
    swapPrompt: 'New to VeriPack?',
    swapLabel: 'Create an account',
    swapTo: '/signup',
  },
  signup: {
    eyebrow: 'Get started',
    title: 'Create your workspace',
    description: 'Verify label compliance in seconds. Every scan stays private to your account.',
    submit: 'Create account',
    swapPrompt: 'Already have an account?',
    swapLabel: 'Sign in',
    swapTo: '/login',
  },
};

const HIGHLIGHTS = [
  'OCR + AI structuring on every upload',
  'Category rules for food, cosmetics and supplements',
  'Private scan history scoped to your account',
];

function Field({ icon: Icon, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          {...props}
          className="h-11 w-full rounded-xl border border-line-strong bg-elevated pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus-ring"
        />
      </span>
    </label>
  );
}

export function Auth({ mode }) {
  const copy = COPY[mode];
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const destination = location.state?.from?.pathname ?? '/scan';
  if (user) return <Navigate to={destination} replace />;

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signup({ name: form.name, email: form.email, password: form.password });
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate(destination, { replace: true });
    } catch (exception) {
      setError(exception.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div {...pageTransition} className="container-page py-16">
      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="hidden md:block">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent shadow-glow">
            <ScanLine className="h-5 w-5 text-white" strokeWidth={2.4} />
          </span>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
            Label compliance you can defend.
          </h2>
          <ul className="mt-6 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="panel p-6 sm:p-8">
          <p className="text-2xs font-medium uppercase tracking-[0.18em] text-accent-soft">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {copy.title}
          </h1>
          <p className="mt-2 text-sm text-muted">{copy.description}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'signup' ? (
              <Field
                icon={User}
                label="Name"
                name="name"
                autoComplete="name"
                placeholder="Ada Lovelace"
                required
                value={form.name}
                onChange={update('name')}
              />
            ) : null}
            <Field
              icon={Mail}
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              value={form.email}
              onChange={update('email')}
            />
            <Field
              icon={Lock}
              label="Password"
              name="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              minLength={mode === 'signup' ? 8 : undefined}
              required
              value={form.password}
              onChange={update('password')}
            />

            {error ? (
              <p className="flex items-start gap-2 rounded-xl border border-bad/40 bg-bad-dim px-3 py-2.5 text-xs text-bad">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            ) : null}

            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Just a second…' : copy.submit}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted">
            {copy.swapPrompt}{' '}
            <Link to={copy.swapTo} className="rounded font-medium text-ink underline-offset-4 hover:underline focus-ring">
              {copy.swapLabel}
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registrationSchema } from '@/lib/validation';
import { api, useMarket } from '../marketplace/provider';
import { Button } from '../ui/button';
import { Field, Input } from '../ui/primitives';
import { titleCase } from '@/lib/utils';
const basic = z.object({ email: z.email(), password: z.string().min(1) });
type Values = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};
export function AuthForm({ mode }: { mode: string }) {
  const router = useRouter(),
    { refresh } = useMarket();
  const [error, setError] = useState(''),
    [done, setDone] = useState(false);
  const register = mode === 'register',
    login = mode === 'login';
  const schema = register ? registrationSchema : login ? basic : z.object({ email: z.email() });
  const form = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: '',
      terms: false,
    },
  });
  async function submit(values: Values) {
    try {
      setError('');
      await api('auth', { ...values, action: mode });
      if (login || register) {
        await refresh();
        router.push(register ? '/verify-email' : '/profile');
        router.refresh();
      } else setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to continue');
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-story">
        <span className="eyebrow">WELCOME TO YOUR NEXT CHAPTER</span>
        <h1>
          Good finds.
          <br />
          Even better
          <br />
          connections.
        </h1>
        <p>A thoughtful community for things with more to give.</p>
      </div>
      <div className="auth-form panel">
        <h1>{login ? 'Welcome back.' : register ? 'Make yourself at home.' : titleCase(mode)}</h1>
        <p>
          {login
            ? 'Your next favourite is waiting.'
            : register
              ? 'Join a community that sees the possibility in pre-loved.'
              : 'Email and phone delivery are simulated in this local demo.'}
        </p>
        {done ? (
          <div className="notice">
            <h3>Demo request received</h3>
            <p>No email was sent. Use alex@example.com / Seconda2026! to explore the full demo.</p>
            <Button asChild>
              <Link href="/login">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(submit)}>
            {register && (
              <div className="two-col">
                {(['firstName', 'lastName'] as const).map((key) => (
                  <Field
                    key={key}
                    label={key === 'firstName' ? 'First name' : 'Last name'}
                    error={form.formState.errors[key]?.message}
                  >
                    <Input {...form.register(key)} />
                  </Field>
                ))}
              </div>
            )}
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input autoComplete="email" type="email" {...form.register('email')} />
            </Field>
            {(register || login) && (
              <Field label="Password" error={form.formState.errors.password?.message}>
                <Input
                  autoComplete={register ? 'new-password' : 'current-password'}
                  type="password"
                  {...form.register('password')}
                />
              </Field>
            )}
            {register && (
              <>
                <Field
                  label="Confirm password"
                  error={form.formState.errors.confirmPassword?.message}
                >
                  <Input type="password" {...form.register('confirmPassword')} />
                </Field>
                <label className="check">
                  <input type="checkbox" {...form.register('terms')} />I accept the{' '}
                  <Link href="/terms">terms</Link> and <Link href="/privacy">privacy policy</Link>.
                </label>
                {form.formState.errors.terms && (
                  <p className="field-error">{form.formState.errors.terms.message}</p>
                )}
              </>
            )}
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? 'Please wait…'
                : login
                  ? 'Sign in'
                  : register
                    ? 'Create account'
                    : 'Send demo request'}
            </Button>
          </form>
        )}
        {login && (
          <>
            <Link className="text-button" href="/forgot-password">
              Forgot password?
            </Link>
            <div className="notice">
              <b>Take a look around</b>
              <p>
                Demo: alex@example.com
                <br />
                Password: Seconda2026!
              </p>
              <Button
                variant="outline"
                className="full"
                onClick={() => {
                  form.setValue('email', 'alex@example.com');
                  form.setValue('password', 'Seconda2026!');
                }}
              >
                Fill demo credentials
              </Button>
            </div>
          </>
        )}
        <p>
          {register ? 'Already at home here?' : 'New to Shopper?'}{' '}
          <Link href={register ? '/login' : '/register'}>
            {register ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </div>
    </div>
  );
}

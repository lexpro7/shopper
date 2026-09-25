'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMarket } from '../marketplace/provider';
import { Button } from '../ui/button';
import { ThemeSwitcher } from '../theme/theme-switcher';
import { Badge, Field, Input, Modal, Select, Switch } from '../ui/primitives';
export function Settings({ section }: { section: string }) {
  const { account, act } = useMarket();
  const router = useRouter();
  const [modal, setModal] = useState(''),
    [preferences, setPreferences] = useState<Record<string, string | boolean>>({
      language: 'English',
      currency: 'CHF',
      email: true,
      push: true,
      public: true,
      twoFA: false,
    }),
    [oldPassword, setOldPassword] = useState(''),
    [password, setPassword] = useState('');
  useEffect(() => {
    try {
      const p = localStorage.getItem('seconda-preferences');
      if (p) setPreferences(JSON.parse(p));
    } catch {}
  }, []);
  function pref(key: string, value: string | boolean) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    localStorage.setItem('seconda-preferences', JSON.stringify(next));
    toast.success('Preference saved on this device');
  }
  if (!account) return null;
  return (
    <div className="settings-form">
      <h1>
        {section === 'addresses'
          ? 'Your addresses'
          : section === 'payments'
            ? 'Payment preferences'
            : section === 'security'
              ? 'Account security'
              : 'Make yourself at home'}
      </h1>
      {section === 'addresses' ? (
        <>
          {account.addresses.map((a) => (
            <div className="record-row" key={a.id}>
              <div>
                <h3>{a.name}</h3>
                <p>
                  {a.street}
                  <br />
                  {a.postalCode} {a.city}, {a.country}
                  <br />
                  {a.phone}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  void act('addresses', { id: a.id, action: 'delete' }, 'Address removed').catch(
                    () => {},
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
          <Button onClick={() => setModal('Add an address')}>Add an address</Button>
        </>
      ) : section === 'payments' ? (
        <div className="panel">
          <h2>Choose your favourite way to pay</h2>
          <p>
            Only a preference is saved. Card numbers, bank details and payment credentials are never
            collected.
          </p>
          {['Card', 'TWINT', 'PayPal'].map((method) => (
            <label key={method} className="radio-card">
              <input
                type="radio"
                name="payment"
                checked={(preferences.payment || 'TWINT') === method}
                onChange={() => pref('payment', method)}
              />
              {method}
              <Badge>Demo</Badge>
            </label>
          ))}
        </div>
      ) : section === 'security' ? (
        <>
          <div className="panel">
            <h2>Password & sign-in</h2>
            <Button variant="outline" onClick={() => setModal('Change password')}>
              Change password
            </Button>
            <div className="preference-row">
              <div>
                Two-factor authentication
                <small>Demo preference only; codes are not enforced.</small>
              </div>
              <Switch
                label="Demo two-factor preference"
                checked={!!preferences.twoFA}
                onChange={() => pref('twoFA', !preferences.twoFA)}
              />
            </div>
          </div>
          <div className="panel">
            <h2>Verification</h2>
            <div className="preference-row">
              <span>Email · {account.user.email}</span>
              <Badge>{account.user.verified ? 'Demo verified' : 'Unverified'}</Badge>
            </div>
            <div className="preference-row">
              <span>Phone verification</span>
              <Button variant="outline" size="sm" onClick={() => setModal('Verify phone')}>
                Verify phone
              </Button>
            </div>
            <p className="muted">Verification is simulated. No SMS or email is sent.</p>
          </div>
          <div className="panel">
            <h2>Active session</h2>
            <p>This browser · Local demo session</p>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await act('auth', { action: 'logout' }, 'Session cleared');
                  router.push('/login');
                  router.refresh();
                } catch {}
              }}
            >
              Sign out
            </Button>
            <p className="notice">
              With DEMO_MODE enabled, the shared Alex demo account remains available for browsing.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setModal('Request account deletion')}>
            Request account deletion
          </Button>
        </>
      ) : (
        <>
          <form
            className="panel"
            onSubmit={async (e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.currentTarget));
              try {
                await act('settings', data, 'Profile updated');
              } catch {}
            }}
          >
            <h2>Your profile</h2>
            <div className="two-col">
              <Field label="First name">
                <Input
                  name="firstName"
                  minLength={2}
                  required
                  defaultValue={account.user.firstName}
                />
              </Field>
              <Field label="Last name">
                <Input
                  name="lastName"
                  minLength={2}
                  required
                  defaultValue={account.user.lastName}
                />
              </Field>
            </div>
            <Field label="Location">
              <Input name="location" minLength={2} required defaultValue={account.user.location} />
            </Field>
            <Field label="Email">
              <Input value={account.user.email} disabled />
            </Field>
            <Button type="submit">Save profile</Button>
          </form>
          <ThemeSwitcher appearance />
          <div className="panel">
            <h2>Language & currency</h2>
            <Field label="Preferred language">
              <Select
                value={String(preferences.language)}
                onChange={(e) => pref('language', e.target.value)}
              >
                {['English', 'Deutsch', 'Français', 'Italiano'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <p className="muted">
              Language preference is saved; this demo’s content is in English.
            </p>
            <Field label="Currency">
              <Select value="CHF" onChange={() => {}}>
                <option value="CHF">CHF — Swiss franc</option>
              </Select>
            </Field>
          </div>
          <div className="panel">
            <h2>Notifications & privacy</h2>
            {[
              ['email', 'Email updates'],
              ['push', 'Browser notification preference'],
              ['public', 'Show my profile publicly'],
            ].map(([key, label]) => (
              <div className="preference-row" key={key}>
                <span>{label}</span>
                <Switch
                  label={label}
                  checked={!!preferences[key]}
                  onChange={() => pref(key, !preferences[key])}
                />
              </div>
            ))}
            <p className="muted">
              Preferences are stored on this device. External notifications and privacy enforcement
              are not enabled in the demo.
            </p>
            <Link href="/privacy">Read the demo privacy notice ↗</Link>
          </div>
        </>
      )}
      <Modal title={modal} open={!!modal} onOpenChange={(v) => !v && setModal('')}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const values = Object.fromEntries(new FormData(e.currentTarget));
            try {
              if (modal === 'Add an address') await act('addresses', values, 'Address saved');
              else if (modal === 'Change password')
                await act(
                  'security',
                  { action: 'password', oldPassword, password },
                  'Password changed',
                );
              else if (modal === 'Request account deletion')
                await act(
                  'reports',
                  {
                    target: account.user.id,
                    reason: 'Account deletion requested by the account owner.',
                  },
                  'Deletion request recorded for admin review',
                );
              else toast.success('Demo only: no verification code was sent.');
              setModal('');
            } catch {}
          }}
        >
          {modal === 'Add an address' ? (
            <>
              {[
                ['name', 'Full name'],
                ['street', 'Street and number'],
                ['postalCode', 'Postal code'],
                ['city', 'City'],
                ['country', 'Country'],
                ['phone', 'Phone'],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <Input
                    name={key}
                    required
                    minLength={key === 'phone' ? 7 : 3}
                    defaultValue={key === 'country' ? 'Switzerland' : ''}
                  />
                </Field>
              ))}
            </>
          ) : modal === 'Change password' ? (
            <>
              <Field label="Current password">
                <Input
                  required
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </Field>
              <Field label="New password (10+ characters)">
                <Input
                  required
                  minLength={10}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            </>
          ) : modal === 'Verify phone' ? (
            <Field label="Phone number">
              <Input type="tel" name="phone" minLength={7} required />
            </Field>
          ) : (
            <p>
              This records a request for administrator review. Your orders and listings remain
              available until reviewed.
            </p>
          )}
          <Button type="submit" className="full">
            Confirm
          </Button>
        </form>
      </Modal>
    </div>
  );
}

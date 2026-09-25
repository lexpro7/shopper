'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LockKeyhole, Check } from 'lucide-react';
import { addressSchema } from '@/lib/validation';
import { money } from '@/lib/utils';
import { useMarket } from '../marketplace/provider';
import { Button } from '../ui/button';
import { Breadcrumbs, EmptyState, Field, Input, Modal, Skeleton } from '../ui/primitives';
type Values = z.infer<typeof addressSchema>;
export function Checkout() {
  const { account, loading, act } = useMarket(),
    router = useRouter();
  const [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const form = useForm<Values>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      street: '',
      postalCode: '',
      city: '',
      state: '',
      country: 'Switzerland',
      phone: '',
      delivery: 'shipping',
      payment: 'TWINT',
      promo: '',
    },
  });
  const initializedUser = useRef('');
  useEffect(() => {
    if (!account || initializedUser.current === account.user.id) return;
    initializedUser.current = account.user.id;
    const address = account.addresses[0];
    form.setValue('firstName', account.user.firstName);
    form.setValue('lastName', account.user.lastName);
    form.setValue('email', account.user.email);
    if (address) {
      form.setValue('street', address.street);
      form.setValue('postalCode', address.postalCode);
      form.setValue('city', address.city);
      form.setValue('country', address.country);
      form.setValue('phone', address.phone);
    }
  }, [account, form]);
  useEffect(() => {
    form.setValue('promo', sessionStorage.getItem('seconda-promo') || '');
  }, [form]);
  const values = useWatch({ control: form.control }) as Values;
  if (loading)
    return (
      <div className="container page">
        <Skeleton />
      </div>
    );
  if (!account?.cart.length)
    return (
      <div className="container page">
        <EmptyState title="Your bag is empty" />
      </div>
    );
  const subtotal = account.cart.reduce((a, c) => a + c.quantity * c.listing.price, 0),
    shipping = values.delivery === 'pickup' ? 0 : 790,
    discount = values.promo === 'HELLO10' ? Math.round(subtotal * 0.1) : 0;
  async function place() {
    setBusy(true);
    setError('');
    try {
      const order = (await act('orders', form.getValues(), 'Your demo order is confirmed')) as {
        id: string;
      };
      sessionStorage.removeItem('seconda-promo');
      router.push(`/order/success/${order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to place order');
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Your bag', href: '/cart' }, { label: 'Checkout' }]} />
      <h1>A new chapter is nearly here.</h1>
      <p className="lede">
        <LockKeyhole size={15} /> Secure demo checkout · No money will be charged
      </p>
      <form onSubmit={form.handleSubmit(() => setConfirm(true))} className="checkout-layout">
        <div className="checkout-sections">
          <section className="panel">
            <h2>
              <span className="step-number">1</span>Contact details
            </h2>
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register('email')} />
            </Field>
          </section>
          <section className="panel">
            <h2>
              <span className="step-number">2</span>Delivery address
            </h2>
            <div className="form-grid">
              {[
                ['firstName', 'First name'],
                ['lastName', 'Last name'],
                ['company', 'Company (optional)'],
                ['street', 'Street and number'],
                ['apartment', 'Apartment (optional)'],
                ['postalCode', 'Postal code'],
                ['city', 'City'],
                ['state', 'Canton / state'],
                ['country', 'Country'],
                ['phone', 'Phone'],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  error={form.formState.errors[key as keyof Values]?.message}
                >
                  <Input {...form.register(key as keyof Values)} />
                </Field>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2>
              <span className="step-number">3</span>How should it get to you?
            </h2>
            <label className="radio-card">
              <input type="radio" value="shipping" {...form.register('delivery')} />
              Tracked delivery · CHF 7.90 <small>2–4 business days</small>
            </label>
            <label className="radio-card">
              <input type="radio" value="pickup" {...form.register('delivery')} />
              Local pickup · Free <small>Arrange with each seller</small>
            </label>
          </section>
          <section className="panel">
            <h2>
              <span className="step-number">4</span>Payment
            </h2>
            {['Card', 'TWINT', 'PayPal'].map((method) => (
              <label className="radio-card" key={method}>
                <input type="radio" value={method} {...form.register('payment')} />
                {method}
                <small>Simulated payment</small>
              </label>
            ))}
            <p className="notice">
              This is a demonstration. Do not enter real card or bank details. We do not collect
              payment credentials.
            </p>
          </section>
          <section className="panel">
            <h2>
              <span className="step-number">5</span>Review your order
            </h2>
            <p>
              {account.cart.length} items ·{' '}
              {values.delivery === 'pickup' ? 'Free collection' : `Delivery to ${values.city}`} ·{' '}
              {values.payment}
            </p>
            <label className="check">
              <input type="checkbox" required />I understand this is a demo purchase and agree to
              the demo terms.
            </label>
            {error && (
              <p role="alert" className="field-error">
                {error}
              </p>
            )}
          </section>
        </div>
        <aside className="summary panel">
          <h2>Your good finds</h2>
          {account.cart.map((c) => (
            <div className="summary-product" key={c.id}>
              <span>
                {c.listing.title}
                <small>Quantity: {c.quantity}</small>
              </span>
              <b>{money(c.listing.price * c.quantity)}</b>
            </div>
          ))}
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{money(shipping)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>−{money(discount)}</dd>
            </div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{money(subtotal + shipping - discount)}</dd>
            </div>
          </dl>
          <Field label="Promo code">
            <Input {...form.register('promo')} />
          </Field>
          <Button className="full" type="submit">
            <LockKeyhole size={16} />
            Review & confirm
          </Button>
        </aside>
      </form>
      <Modal
        title="Confirm your demo payment"
        description="No real payment will be processed."
        open={confirm}
        onOpenChange={setConfirm}
      >
        <div className="payment-confirm">
          <Check size={34} />
          <h2>{money(subtotal + shipping - discount)}</h2>
          <p>{values.payment} · Demo transaction</p>
          <Button className="full" disabled={busy} onClick={() => void place()}>
            {busy ? 'Processing…' : 'Confirm demo payment'}
          </Button>
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            Back to checkout
          </Button>
        </div>
      </Modal>
    </div>
  );
}

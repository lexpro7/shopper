'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ShieldCheck, Trash2 } from 'lucide-react';
import { useMarket } from '../marketplace/provider';
import { ImageFallback } from '../marketplace/image-fallback';
import { Button } from '../ui/button';
import {
  Breadcrumbs,
  EmptyState,
  Input,
  Price,
  QuantitySelector,
  Skeleton,
} from '../ui/primitives';
import { money } from '@/lib/utils';
import { toast } from 'sonner';
export function Cart() {
  const { account, loading, act, favorite } = useMarket();
  const [promo, setPromo] = useState(''),
    [discount, setDiscount] = useState(false);
  if (loading)
    return (
      <div className="container page">
        <Skeleton />
      </div>
    );
  if (!account?.cart.length)
    return (
      <div className="container page">
        <EmptyState
          title="Your bag is full of possibilities"
          text="Find something you love and give it a new chapter."
        />
      </div>
    );
  const subtotal = account.cart.reduce((a, c) => a + c.quantity * c.listing.price, 0);
  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Your bag' }]} />
      <h1>A few very good finds.</h1>
      <p className="lede">Your bag · {account.cart.length} items</p>
      <div className="checkout-layout">
        <div className="cart-items">
          {account.cart.map((c) => (
            <article className="cart-item" key={c.id}>
              <Link className="cart-photo" href={`/listing/${c.listing.slug}`}>
                <ImageFallback src={c.listing.images[0]?.url} alt={c.listing.title} />
              </Link>
              <div>
                <small>
                  {c.listing.seller.firstName} · {c.listing.location}
                </small>
                <Link href={`/listing/${c.listing.slug}`}>
                  <h3>{c.listing.title}</h3>
                </Link>
                <p>{c.listing.condition}</p>
                <QuantitySelector
                  value={c.quantity}
                  max={c.listing.quantity}
                  onChange={(quantity) =>
                    void act('cart', { id: c.listingId, quantity }, '').catch(() => {})
                  }
                />
                <button
                  className="text-button"
                  onClick={async () => {
                    favorite(c.listingId);
                    try {
                      await act('cart', { id: c.listingId, quantity: 0 }, 'Saved for later');
                    } catch {}
                  }}
                >
                  Save for later
                </button>
              </div>
              <div className="cart-price">
                <Price value={c.listing.price * c.quantity} />
                <button
                  className="icon-button"
                  aria-label={`Remove ${c.listing.title}`}
                  onClick={() =>
                    void act('cart', { id: c.listingId, quantity: 0 }, 'Removed from bag').catch(
                      () => {},
                    )
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
        <aside className="summary panel">
          <h2>Order summary</h2>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{money(790)}</dd>
            </div>
            {discount && (
              <div>
                <dt>HELLO10 · 10% off</dt>
                <dd>−{money(Math.round(subtotal * 0.1))}</dd>
              </div>
            )}
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{money(subtotal + 790 - (discount ? Math.round(subtotal * 0.1) : 0))}</dd>
            </div>
          </dl>
          <div className="promo">
            <Input
              aria-label="Promo code"
              placeholder="Promo code · try HELLO10"
              value={promo}
              onChange={(e) => setPromo(e.target.value.toUpperCase())}
            />
            <Button
              variant="outline"
              onClick={() => {
                if (promo === 'HELLO10') {
                  setDiscount(true);
                  sessionStorage.setItem('seconda-promo', promo);
                  toast.success('10% demo discount applied');
                } else toast.error('Try HELLO10 for the demo discount.');
              }}
            >
              Apply
            </Button>
          </div>
          <Button asChild className="full">
            <Link href="/checkout">
              Continue to checkout <ArrowRight size={17} />
            </Link>
          </Button>
          <p>
            <ShieldCheck size={16} />
            Demo checkout. No real payment.
          </p>
        </aside>
      </div>
    </div>
  );
}

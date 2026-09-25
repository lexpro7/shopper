'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useMarket } from '../marketplace/provider';
import { ImageFallback } from '../marketplace/image-fallback';
import {
  Badge,
  EmptyState,
  Field,
  Input,
  Modal,
  Price,
  Select,
  Tabs,
  Textarea,
} from '../ui/primitives';
import { Button } from '../ui/button';
import { money } from '@/lib/utils';
import type { OrderRecord } from '@/types/account';
export function Orders({ sales = false, id }: { sales?: boolean; id?: string }) {
  const { account, act } = useMarket(),
    [tab, setTab] = useState('All');
  if (!account) return null;
  const orders = account.orders.filter((o) =>
    sales
      ? o.items.some((i) => i.listing.sellerId === account.user.id)
      : o.buyerId === account.user.id,
  );
  if (id) {
    const order = orders.find((o) => o.id === id);
    return order ? (
      <OrderDetail order={order} />
    ) : (
      <EmptyState title="Order not found" href="/profile/purchases" action="Back to purchases" />
    );
  }
  const filtered = orders.filter((o) => tab === 'All' || o.status === tab);
  return (
    <>
      <h1>{sales ? 'Your sales' : 'Your purchases'}</h1>
      {sales && (
        <div className="stats-grid">
          {[
            [
              'Revenue',
              money(
                orders.reduce(
                  (a, o) =>
                    a +
                    o.items
                      .filter((i) => i.listing.sellerId === account.user.id)
                      .reduce((t, i) => t + i.price * i.quantity, 0),
                  0,
                ),
              ),
            ],
            ['Orders', orders.length],
            [
              'Average order',
              money(
                orders.length
                  ? Math.round(orders.reduce((a, o) => a + o.total, 0) / orders.length)
                  : 0,
              ),
            ],
            ['To ship', orders.filter((o) => o.status === 'Paid').length],
          ].map(([k, v]) => (
            <div className="stat" key={k}>
              <small>{k}</small>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
      )}
      <Tabs
        items={
          sales
            ? ['All', 'Paid', 'Shipped', 'Completed', 'Cancelled']
            : [
                'All',
                'Awaiting payment',
                'Paid',
                'Shipped',
                'Delivered',
                'Completed',
                'Cancelled',
                'Returned',
              ]
        }
        value={tab}
        onChange={setTab}
      />
      {filtered.length ? (
        filtered.map((o) => (
          <div className="order-card" key={o.id}>
            <div className="order-card-header">
              <span>
                Order {o.id} · {new Date(o.createdAt).toLocaleDateString('en-CH')}
              </span>
              <Badge>{o.status}</Badge>
            </div>
            {o.items
              .filter((i) => !sales || i.listing.sellerId === account.user.id)
              .map((i) => (
                <div className="order-card-item" key={i.id}>
                  <div>
                    <ImageFallback src={i.listing.images[0]?.url} alt={i.listing.title} />
                  </div>
                  <div>
                    <Link href={`/listing/${i.listing.slug}`}>
                      <h3>{i.listing.title}</h3>
                    </Link>
                    <p>
                      {i.listing.seller.firstName} · Quantity {i.quantity}
                    </p>
                  </div>
                  <Price value={i.price * i.quantity} />
                </div>
              ))}
            <div className="order-actions">
              {sales && o.status === 'Paid' && (
                <Button
                  size="sm"
                  onClick={() =>
                    void act(
                      'order-status',
                      { id: o.id, status: 'Shipped' },
                      'Marked as shipped',
                    ).catch(() => {})
                  }
                >
                  Mark as shipped
                </Button>
              )}
              <Button asChild size="sm" variant="outline">
                <Link href={`/profile/purchases/${o.id}`}>View order</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/profile/messages">Contact {sales ? 'buyer' : 'seller'}</Link>
              </Button>
            </div>
          </div>
        ))
      ) : (
        <EmptyState
          title={`No ${tab.toLowerCase() === 'all' ? '' : tab.toLowerCase()} orders yet`}
          text="Your next great find could be right around the corner."
        />
      )}
    </>
  );
}
function OrderDetail({ order: o }: { order: OrderRecord }) {
  const { act } = useMarket();
  const [modal, setModal] = useState(''),
    [text, setText] = useState(''),
    [rating, setRating] = useState('5'),
    [listing, setListing] = useState(o.items[0]?.listingId || '');
  const stages = ['Ordered', 'Paid', 'Shipped', 'Out for delivery', 'Delivered'];
  const active = Math.max(1, stages.indexOf(o.status));
  async function submit() {
    try {
      if (modal === 'Leave a review')
        await act('reviews', { id: listing, rating: Number(rating), text }, 'Review published');
      else await act('disputes', { id: o.id, reason: text }, 'Request submitted');
      setModal('');
    } catch {}
  }
  return (
    <>
      <h1>Your order</h1>
      <div className="order-card-header">
        <span>{o.id}</span>
        <Badge>{o.status}</Badge>
      </div>
      <div className="timeline">
        {stages.map((s, i) => (
          <div key={s} className={i <= active ? 'complete' : ''}>
            <span>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      <div className="panel">
        {o.items.map((i) => (
          <div className="order-card-item" key={i.id}>
            <div>
              <ImageFallback src={i.listing.images[0]?.url} alt={i.listing.title} />
            </div>
            <div>
              <h3>{i.listing.title}</h3>
              <p>
                {i.quantity} × {money(i.price)}
              </p>
            </div>
            <Price value={i.price * i.quantity} />
          </div>
        ))}
        <div className="summary-total">
          Total <b>{money(o.total)}</b>
        </div>
        <p>
          <b>Delivery address</b>
          <br />
          {o.address}
        </p>
        <p>
          <b>Payment</b>
          <br />
          {o.paymentMethod}
        </p>
        <details>
          <summary>Track your order</summary>
          <p>Demo tracking: {o.status}. No physical shipment is sent in demo mode.</p>
        </details>
      </div>
      <div className="inline-actions" style={{ marginTop: 25 }}>
        <Button asChild variant="outline">
          <Link href="/profile/messages">Contact seller</Link>
        </Button>
        {['Request return', 'Open dispute', 'Leave a review'].map((s) => (
          <Button key={s} variant="outline" onClick={() => setModal(s)}>
            {s}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            void act('order-status', { id: o.id, status: 'Completed' }, 'Order completed').catch(
              () => {},
            )
          }
        >
          Confirm receipt
        </Button>
      </div>
      <Modal title={modal} open={!!modal} onOpenChange={(v) => !v && setModal('')}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {modal === 'Leave a review' && (
            <>
              <Field label="Item">
                <Select value={listing} onChange={(e) => setListing(e.target.value)}>
                  {o.items.map((i) => (
                    <option key={i.id} value={i.listingId}>
                      {i.listing.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Rating">
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </Field>
            </>
          )}
          <Field label={modal === 'Leave a review' ? 'Your review' : 'Tell us what happened'}>
            <Textarea
              required
              minLength={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </Field>
          <Button type="submit" className="full">
            Submit
          </Button>
        </form>
      </Modal>
    </>
  );
}

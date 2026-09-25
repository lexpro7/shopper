'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';
import { useMarket } from '../marketplace/provider';
import { ProductGrid } from '../marketplace/product-card';
import {
  Badge,
  EmptyState,
  Field,
  Input,
  Modal,
  Rating,
  Select,
  Switch,
  Tabs,
  Textarea,
} from '../ui/primitives';
import { Button } from '../ui/button';
import { money, titleCase } from '@/lib/utils';
export function Collections({ section, products }: { section: string; products: Product[] }) {
  const { account, act } = useMarket(),
    router = useRouter();
  const [tab, setTab] = useState(
      section === 'listings'
        ? 'Active'
        : section === 'offers'
          ? 'Received'
          : section === 'reviews'
            ? 'Received'
            : section === 'auctions'
              ? 'Active bids'
              : 'All',
    ),
    [dialog, setDialog] = useState<{ title: string; id: string; action: string } | null>(null),
    [amount, setAmount] = useState(''),
    [text, setText] = useState(''),
    [rating, setRating] = useState('5');
  if (!account) return null;
  async function action(resource: string, data: Record<string, unknown>, message = 'Saved') {
    try {
      await act(resource, data, message);
      router.refresh();
    } catch {}
  }
  const empty = (
    <EmptyState title="Nothing here just yet" text="This is where the next chapter will appear." />
  );
  let content: React.ReactNode = null;
  if (section === 'favorites') {
    const saved = products.filter((p) => account.favorites.some((f) => f.listingId === p.id));
    content = saved.length ? (
      <>
        <ProductGrid products={saved} />
        <div className="notice">
          Saved items stay here even when sold. Open a listing to add it to your bag. Original
          prices show price changes where available.
        </div>
      </>
    ) : (
      empty
    );
  }
  if (section === 'listings') {
    const mine = products.filter((p) => p.sellerId === account.user.id && p.status === tab);
    content = (
      <>
        <div className="inline-actions" style={{ marginBottom: 20 }}>
          <Button asChild>
            <Link href="/sell">Create a listing</Link>
          </Button>
        </div>
        <Tabs
          items={['Active', 'Draft', 'Sold', 'Expired', 'Archived']}
          value={tab}
          onChange={setTab}
        />
        {mine.length
          ? mine.map((p) => (
              <div className="record-row" key={p.id}>
                <div>
                  <Link href={`/listing/${p.slug}`}>
                    <h3>{p.title}</h3>
                  </Link>
                  <p>
                    {money(p.price)} · {p.views} views · {p.condition}
                  </p>
                  <Badge>{p.promoted ? 'Promoted' : p.status}</Badge>
                </div>
                <div className="inline-actions">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/listing/${p.id}/edit`}>Edit</Link>
                  </Button>
                  <Select
                    aria-label={`Actions for ${p.title}`}
                    value=""
                    onChange={(e) => {
                      const a = e.target.value;
                      if (a === 'delete') {
                        setDialog({ title: 'Archive this listing?', id: p.id, action: a });
                        return;
                      }
                      void action('listings', { id: p.id, action: a }, 'Listing updated');
                    }}
                  >
                    <option value="" disabled>
                      More actions
                    </option>
                    {[
                      ['duplicate', 'Duplicate'],
                      ['pause', 'Pause'],
                      ['activate', 'Activate'],
                      ['archive', 'Archive'],
                      ['delete', 'Delete (archive)'],
                      ['sold', 'Mark sold'],
                      ['promote', 'Promote (demo)'],
                    ].map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            ))
          : empty}
      </>
    );
  }
  if (section === 'offers') {
    const offers = account.offers.filter((o) =>
      tab === 'Received'
        ? o.listing.sellerId === account.user.id
        : tab === 'Sent'
          ? o.userId === account.user.id
          : o.status === tab,
    );
    content = (
      <>
        <Tabs
          items={['Received', 'Sent', 'Accepted', 'Declined', 'Expired']}
          value={tab}
          onChange={setTab}
        />
        {offers.length
          ? offers.map((o) => (
              <div className="record-row" key={o.id}>
                <div>
                  <Link href={`/listing/${o.listing.slug}`}>
                    <h3>{o.listing.title}</h3>
                  </Link>
                  <p>
                    {o.user.firstName} offered <b>{money(o.amount)}</b>
                  </p>
                  <Badge>{o.status}</Badge>
                </div>
                {((o.status === 'Pending' && o.listing.sellerId === account.user.id) ||
                  (o.status === 'Countered' && o.userId === account.user.id)) && (
                  <div className="inline-actions">
                    <Button
                      size="sm"
                      onClick={() =>
                        void action('offers', { id: o.id, action: 'accept' }, 'Offer accepted')
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void action('offers', { id: o.id, action: 'decline' }, 'Offer declined')
                      }
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAmount(String(o.amount / 100));
                        setDialog({ title: 'Make a counter offer', id: o.id, action: 'counter' });
                      }}
                    >
                      Counter
                    </Button>
                  </div>
                )}
              </div>
            ))
          : empty}
      </>
    );
  }
  if (section === 'auctions') {
    const bids = account.bids.filter((b) => {
      const ended = !!b.listing.auctionEndsAt && new Date(b.listing.auctionEndsAt) < new Date();
      return tab === 'Active bids'
        ? !ended
        : tab === 'Won'
          ? ended && b.amount === b.listing.currentBid
          : tab === 'Lost'
            ? ended && b.amount < b.listing.currentBid
            : false;
    });
    content = (
      <>
        <Tabs items={['Active bids', 'Won', 'Lost', 'Watching']} value={tab} onChange={setTab} />
        {tab === 'Watching' ? (
          <ProductGrid
            products={products.filter(
              (p) =>
                p.listingType === 'Auction' && account.favorites.some((f) => f.listingId === p.id),
            )}
          />
        ) : bids.length ? (
          bids.map((b) => (
            <div className="record-row" key={b.id}>
              <div>
                <h3>{b.listing.title}</h3>
                <p>
                  Your bid {money(b.amount)} · Current bid {money(b.listing.currentBid)}
                </p>
                <Badge>{b.amount === b.listing.currentBid ? 'Highest bid' : 'Outbid'}</Badge>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/listing/${b.listing.slug}`}>View auction</Link>
              </Button>
            </div>
          ))
        ) : (
          empty
        )}
      </>
    );
  }
  if (section === 'reviews') {
    const reviews = account.reviews.filter((r) =>
      tab === 'Given' ? r.userId === account.user.id : r.listing.sellerId === account.user.id,
    );
    const pending = account.orders
      .filter((o) => o.buyerId === account.user.id)
      .flatMap((o) => o.items)
      .filter(
        (i) =>
          !account.reviews.some((r) => r.listingId === i.listingId && r.userId === account.user.id),
      );
    content = (
      <>
        <Tabs items={['Received', 'Given', 'Pending']} value={tab} onChange={setTab} />
        {tab === 'Pending'
          ? pending.length
            ? pending.map((i) => (
                <div key={i.id} className="record-row">
                  <h3>{i.listing.title}</h3>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setDialog({ title: 'Leave a review', id: i.listingId, action: 'review' })
                    }
                  >
                    Leave a review
                  </Button>
                </div>
              ))
            : empty
          : reviews.length
            ? reviews.map((r) => (
                <div className="panel review" key={r.id}>
                  <Rating value={r.rating} />
                  <p>{r.text}</p>
                  <small>
                    {r.user.firstName} · {r.listing.title} ·{' '}
                    {new Date(r.createdAt).toLocaleDateString('en-CH')}
                  </small>
                </div>
              ))
            : empty}
      </>
    );
  }
  if (section === 'saved-searches') {
    content = account.searches.length
      ? account.searches.map((s) => (
          <div className="record-row" key={s.id}>
            <div>
              <Link href={`/search?${s.query}`}>
                <h3>{s.name}</h3>
              </Link>
              <p>{decodeURIComponent(s.query) || 'All marketplace listings'}</p>
              <small>
                {
                  products.filter((p) =>
                    p.title
                      .toLowerCase()
                      .includes(new URLSearchParams(s.query).get('q')?.toLowerCase() || ''),
                  ).length
                }{' '}
                matching finds
              </small>
            </div>
            <div className="inline-actions">
              <Switch
                label={`Notifications for ${s.name}`}
                checked={s.notify}
                onChange={() => void action('searches', { id: s.id, action: 'toggle' })}
              />
              <Button size="sm" variant="outline" asChild>
                <Link href={`/search?${s.query}`}>Open search</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  void action('searches', { id: s.id, action: 'delete' }, 'Search removed')
                }
              >
                Delete
              </Button>
            </div>
          </div>
        ))
      : empty;
  }
  if (section === 'notifications') {
    const notices = account.notifications.filter(
      (n) => tab === 'All' || (tab === 'Unread' ? !n.read : n.type === tab),
    );
    content = (
      <>
        <div className="inline-actions" style={{ marginBottom: 20 }}>
          <Button
            variant="outline"
            onClick={() => void action('notifications', {}, 'All notifications marked as read')}
          >
            Mark all as read
          </Button>
        </div>
        <Tabs
          items={[
            'All',
            'Unread',
            'message',
            'sale',
            'purchase',
            'bid',
            'auction',
            'offer',
            'price drop',
            'saved search',
            'review',
            'system',
          ]}
          value={tab}
          onChange={setTab}
        />
        {notices.length
          ? notices.map((n) => (
              <div key={n.id} className={`record-row ${n.read ? '' : 'unread'}`}>
                <div>
                  <Badge>{n.type}</Badge>
                  <h3 style={{ marginTop: 8 }}>{n.title}</h3>
                  <p>{n.text}</p>
                  <small className="muted">
                    {new Date(n.createdAt).toLocaleDateString('en-CH')}
                  </small>
                </div>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void action('notifications', { id: n.id }, 'Marked as read')}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            ))
          : empty}
      </>
    );
  }
  return (
    <>
      <h1>{section === 'listings' ? 'Your listings' : titleCase(section)}</h1>
      {content}
      <Modal
        title={dialog?.title || ''}
        open={!!dialog}
        onOpenChange={(v) => !v && setDialog(null)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!dialog) return;
            try {
              if (dialog.action === 'counter')
                await act(
                  'offers',
                  { id: dialog.id, action: 'counter', amount: Math.round(Number(amount) * 100) },
                  'Counter offer sent',
                );
              else if (dialog.action === 'review')
                await act(
                  'reviews',
                  { id: dialog.id, rating: Number(rating), text },
                  'Review published',
                );
              else await act('listings', { id: dialog.id, action: 'delete' }, 'Listing archived');
              setDialog(null);
              router.refresh();
            } catch {}
          }}
        >
          {dialog?.action === 'counter' ? (
            <Field label="Amount (CHF)">
              <Input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
          ) : dialog?.action === 'review' ? (
            <>
              <Field label="Rating">
                <Select value={rating} onChange={(e) => setRating(e.target.value)}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Review">
                <Textarea
                  required
                  minLength={10}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </Field>
            </>
          ) : (
            <p>Your listing will leave the marketplace and remain in your archive.</p>
          )}
          <Button className="full" type="submit">
            Confirm
          </Button>
        </form>
      </Modal>
    </>
  );
}

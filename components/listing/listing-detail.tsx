'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  MapPin,
  MessageCircle,
  Check,
  Flag,
  ArrowUpRight,
} from 'lucide-react';
import type { Product } from '@/types';
import { useMarket } from '../marketplace/provider';
import { ImageFallback } from '../marketplace/image-fallback';
import { ProductGrid } from '../marketplace/product-card';
import { RecentProducts } from '../marketplace/recent-products';
import { Button } from '../ui/button';
import {
  Avatar,
  Badge,
  Breadcrumbs,
  Field,
  Input,
  Modal,
  Price,
  QuantitySelector,
  Rating,
  Tabs,
  Textarea,
} from '../ui/primitives';
import { money } from '@/lib/utils';
import { toast } from 'sonner';
export function ListingDetail({ product: p, related }: { product: Product; related: Product[] }) {
  const { account, act, favorite } = useMarket(),
    router = useRouter();
  const [index, setIndex] = useState(0),
    [qty, setQty] = useState(1),
    [modal, setModal] = useState(''),
    [amount, setAmount] = useState(''),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState('Description'),
    [remaining, setRemaining] = useState(''),
    [bid, setBid] = useState(p.currentBid),
    [bidCount, setBidCount] = useState(p.bids.length);
  useEffect(() => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem('seconda-viewed') || '[]');
    } catch {}
    localStorage.setItem(
      'seconda-viewed',
      JSON.stringify([p.id, ...ids.filter((id) => id !== p.id)].slice(0, 10)),
    );
  }, [p.id]);
  useEffect(() => {
    if (!p.auctionEndsAt) return;
    const tick = () => {
      const ms = new Date(p.auctionEndsAt!).getTime() - Date.now();
      setRemaining(
        ms <= 0
          ? 'Ended'
          : `${Math.floor(ms / 86400000)}d ${Math.floor(ms / 3600000) % 24}h ${Math.floor(ms / 60000) % 60}m ${Math.floor(ms / 1000) % 60}s`,
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [p.auctionEndsAt]);
  const saved = account?.favorites.some((f) => f.listingId === p.id),
    own = account?.user.id === p.sellerId,
    auction = p.listingType === 'Auction',
    unavailable = p.status !== 'Active' || p.quantity === 0;
  async function add(buy = false) {
    setBusy(true);
    try {
      await act('cart', { id: p.id, quantity: qty }, 'Added to your bag');
      if (buy) router.push('/checkout');
    } catch {
    } finally {
      setBusy(false);
    }
  }
  async function send() {
    setBusy(true);
    try {
      if (modal === 'Report listing')
        await act('reports', { target: p.id, reason }, 'Report sent for review');
      else {
        await act(
          modal === 'Place a bid' ? 'bids' : 'offers',
          { id: p.id, amount: Math.round(Number(amount) * 100) },
          modal === 'Place a bid' ? 'Your bid is placed' : 'Offer sent',
        );
        if (modal === 'Place a bid') {
          setBid(Math.round(Number(amount) * 100));
          setBidCount((c) => c + 1);
        }
      }
      setModal('');
      router.refresh();
    } catch {
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container page">
      <Breadcrumbs
        items={[
          { label: p.category.name, href: `/category/${p.category.slug}` },
          { label: p.title },
        ]}
      />
      <div className="listing-layout">
        <div>
          <div className="gallery-main">
            <ImageFallback
              src={p.images[index]?.url}
              alt={`${p.title} — photo ${index + 1}`}
              priority
            />
            <Badge className="gallery-badge">{p.condition}</Badge>
          </div>
          <div className="thumbnails">
            {p.images.map((img, i) => (
              <button
                key={img.id}
                className={index === i ? 'active' : ''}
                onClick={() => setIndex(i)}
                aria-label={`View photo ${i + 1}`}
              >
                <ImageFallback src={img.url} alt={`Thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
          <div className="listing-description">
            <Tabs
              items={['Description', 'Specifications', 'Delivery', 'Reviews']}
              value={tab}
              onChange={setTab}
            />
            {tab === 'Description' ? (
              <>
                <h2>A little more about this find</h2>
                <p>{p.description}</p>
              </>
            ) : tab === 'Specifications' ? (
              <dl className="specs">
                {Object.entries(JSON.parse(p.specifications) as Record<string, string>).map(
                  ([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ),
                )}
                <div>
                  <dt>Condition</dt>
                  <dd>{p.condition}</dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd>{p.model}</dd>
                </div>
              </dl>
            ) : tab === 'Delivery' ? (
              <>
                <h2>From {p.location}, with care.</h2>
                <p>
                  {p.delivery
                    ? 'Tracked Swiss delivery, normally 2–4 business days. Shipping is CHF 7.90 per order.'
                    : 'Delivery is unavailable.'}{' '}
                  {p.pickup ? 'Free local collection by arrangement.' : ''}
                </p>
                <Link href="/buyer-protection">
                  Read about buyer protection <ArrowUpRight size={15} />
                </Link>
              </>
            ) : (
              <>
                <h2>What buyers are saying</h2>
                {p.reviews.length ? (
                  p.reviews.map((r) => (
                    <div key={r.id} className="review">
                      <Rating value={r.rating} />
                      <p>{r.text}</p>
                      <small>{new Date(r.createdAt).toLocaleDateString('en-CH')}</small>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet for this item.</p>
                )}
              </>
            )}
          </div>
        </div>
        <aside className="listing-buy">
          <div className="listing-topline">
            <span className="eyebrow">
              {p.brand} · {p.location}
            </span>
            <button
              className="icon-button"
              aria-label="Share listing"
              onClick={() => {
                void navigator.clipboard
                  .writeText(window.location.href)
                  .then(() => toast.success('Link copied'))
                  .catch(() => toast.error('Could not copy link'));
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
          <h1>{p.title}</h1>
          <div className="listing-rating">
            <Badge>{p.condition}</Badge>
            <span>•</span>
            <span>{p.quantity} available</span>
          </div>
          {auction && <span className="muted">Current bid · {bidCount} bids</span>}
          <Price value={auction ? bid : p.price} original={p.originalPrice} />
          {auction && (
            <div className="auction-box">
              <span>
                Ends in <b>{remaining || '…'}</b>
              </span>
              <small>Minimum next bid {money(bid + p.minimumBid)}</small>
              <small>{new Date(p.auctionEndsAt!).toLocaleString('en-CH')}</small>
            </div>
          )}
          <div className="purchase-controls">
            {!auction && <QuantitySelector value={qty} max={p.quantity} onChange={setQty} />}
            <Button variant="outline" onClick={() => favorite(p.id)} aria-label="Toggle favorite">
              <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
          {auction ? (
            <Button
              className="full"
              disabled={unavailable || own || remaining === 'Ended'}
              onClick={() => {
                setAmount(String((bid + p.minimumBid) / 100));
                setModal('Place a bid');
              }}
            >
              Place a bid <ArrowUpRight size={18} />
            </Button>
          ) : (
            <>
              <Button
                className="full"
                disabled={busy || unavailable}
                onClick={() => void add(true)}
              >
                {unavailable ? 'Currently unavailable' : 'Buy now'}
                <ArrowUpRight size={18} />
              </Button>
              <Button
                className="full"
                variant="outline"
                disabled={busy || unavailable}
                onClick={() => void add()}
              >
                Add to bag
              </Button>
            </>
          )}
          {p.allowOffers && !own && !unavailable && (
            <button
              className="text-button"
              onClick={() => {
                setAmount(String(Math.round((p.price * 0.9) / 100)));
                setModal('Make an offer');
              }}
            >
              Make an offer
            </button>
          )}
          <div className="delivery-lines">
            {p.delivery && (
              <div>
                <Truck />
                <span>
                  <b>Delivery across Switzerland</b>
                  <small>CHF 7.90 · Estimated 2–4 business days</small>
                </span>
              </div>
            )}
            {p.pickup && (
              <div>
                <MapPin />
                <span>
                  <b>Pick up in {p.location}</b>
                  <small>Free · Arrange directly with the seller</small>
                </span>
              </div>
            )}
            <div>
              <ShieldCheck />
              <span>
                <b>A little more peace of mind</b>
                <small>
                  <Link href="/buyer-protection">Buyer protection explained</Link>
                </small>
              </span>
            </div>
          </div>
          <div className="seller-box">
            <Link href={`/seller/${p.seller.username}`}>
              <Avatar name={`${p.seller.firstName} ${p.seller.lastName}`} />
              <span>
                <b>
                  {p.seller.firstName} {p.seller.lastName}{' '}
                  {p.seller.verified && <Check size={14} />}
                </b>
                <Rating value={p.seller.rating} />
                <small>Member since {new Date(p.seller.createdAt).getFullYear()}</small>
              </span>
              <ArrowUpRight size={18} />
            </Link>
            <Button
              variant="outline"
              className="full"
              onClick={async () => {
                try {
                  const c = (await act('messages', { action: 'start', id: p.id }, '')) as {
                    id: string;
                  };
                  router.push(`/profile/messages?conversation=${c.id}`);
                } catch {}
              }}
            >
              <MessageCircle size={16} />
              Message seller
            </Button>
          </div>
          <p className="payment-note">
            Card · TWINT · PayPal
            <br />
            <small>Demo checkout — no money is charged.</small>
          </p>
          <button className="text-button muted" onClick={() => setModal('Report listing')}>
            <Flag size={13} />
            Report this listing
          </button>
          {auction && (
            <details className="bid-history">
              <summary>Bid history ({bidCount})</summary>
              {[...p.bids].reverse().map((b) => (
                <p key={b.id}>
                  {money(b.amount)} · {new Date(b.createdAt).toLocaleDateString('en-CH')}
                </p>
              ))}
            </details>
          )}
        </aside>
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>You might also love</h2>
          <Link href={`/category/${p.categoryId}`}>
            Explore more <ArrowRightIcon />
          </Link>
        </div>
        <ProductGrid products={related.slice(0, 5)} />
      </section>
      <section className="section">
        <h2>More from this seller</h2>
        <ProductGrid products={related.filter((l) => l.sellerId === p.sellerId).slice(0, 5)} />
      </section>
      <RecentProducts products={[p, ...related]} />
      <Modal
        title={modal}
        open={Boolean(modal)}
        onOpenChange={(v) => !v && setModal('')}
        description={
          modal === 'Report listing'
            ? 'Tell our team what needs a closer look.'
            : `${p.title} · All interactions are demonstrations.`
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          {modal === 'Report listing' ? (
            <Field label="Reason">
              <Textarea
                required
                minLength={10}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
          ) : (
            <Field label="Your amount (CHF)">
              <Input
                autoFocus
                type="number"
                step="0.01"
                min={modal === 'Place a bid' ? (bid + p.minimumBid) / 100 : 1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
          )}
          <Button disabled={busy} className="full" type="submit">
            {busy ? 'Saving…' : modal === 'Report listing' ? 'Send report' : 'Confirm'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
function ArrowRightIcon() {
  return <ArrowUpRight size={16} />;
}

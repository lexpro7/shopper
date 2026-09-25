'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';
import type { User } from '@prisma/client';
import { ProductGrid } from './product-card';
import { Avatar, Rating, Tabs, EmptyState } from '../ui/primitives';
import { Button } from '../ui/button';
import { useMarket } from './provider';
import { useRouter } from 'next/navigation';
export function Seller({
  seller,
  products,
}: {
  seller: Omit<User, 'passwordHash'>;
  products: Product[];
}) {
  const [tab, setTab] = useState('Listings'),
    [following, setFollowing] = useState(false),
    { act } = useMarket(),
    router = useRouter();
  useEffect(
    () => setFollowing(localStorage.getItem(`follow-${seller.id}`) === 'true'),
    [seller.id],
  );
  return (
    <div className="container page">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>›<span>{seller.username}</span>
      </div>
      <div className="seller-hero">
        <Avatar name={`${seller.firstName} ${seller.lastName}`} />
        <div>
          <span className="eyebrow">
            {seller.verified ? 'VERIFIED DEMO SELLER' : 'COMMUNITY MEMBER'}
          </span>
          <h1>
            {seller.firstName} {seller.lastName}
          </h1>
          <Rating
            value={seller.rating}
            count={products.reduce((a, p) => a + p.reviews.length, 0)}
          />
          <p>
            {seller.location} · Joined {new Date(seller.createdAt).getFullYear()} · Replies within a
            day
          </p>
        </div>
        <div className="inline-actions">
          <Button
            variant="outline"
            onClick={() => {
              const next = !following;
              setFollowing(next);
              localStorage.setItem(`follow-${seller.id}`, String(next));
            }}
          >
            {following ? 'Following ✓' : 'Follow seller'}
          </Button>
          <Button
            disabled={!products.length}
            onClick={async () => {
              try {
                const c = (await act('messages', { action: 'start', id: products[0].id }, '')) as {
                  id: string;
                };
                router.push(`/profile/messages?conversation=${c.id}`);
              } catch {}
            }}
          >
            Message seller
          </Button>
        </div>
      </div>
      <Tabs items={['Listings', 'Reviews', 'About']} value={tab} onChange={setTab} />
      {tab === 'Listings' ? (
        products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState title="No listings yet" />
        )
      ) : tab === 'Reviews' ? (
        products.flatMap((p) =>
          p.reviews.map((r) => (
            <div key={r.id} className="review">
              <Rating value={r.rating} />
              <p>{r.text}</p>
              <small>
                {p.title} · {new Date(r.createdAt).toLocaleDateString('en-CH')}
              </small>
            </div>
          )),
        )
      ) : (
        <div className="article">
          <h2>A little about {seller.firstName}</h2>
          <p>
            Based in {seller.location}, with a love for well-made things and thoughtful second
            chances. Happy to answer questions, arrange collection, or carefully pack a find for its
            next home.
          </p>
          <p>
            This is a demonstration seller profile. All listings and seller statistics are sample
            data.
          </p>
        </div>
      )}
    </div>
  );
}

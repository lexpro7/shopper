'use client';
import Link from 'next/link';
import { ArrowUpRight, Bell, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { useMarket } from '../marketplace/provider';
import { ProductGrid } from '../marketplace/product-card';
import { Button } from '../ui/button';
export function Overview({ products }: { products: Product[] }) {
  const { account } = useMarket();
  if (!account) return null;
  const orders = account.orders.filter((o) => o.buyerId === account.user.id),
    sales = account.orders.filter((o) => o.buyerId !== account.user.id);
  return (
    <>
      <div className="account-welcome">
        <div>
          <span className="eyebrow">YOUR LITTLE CORNER OF SHOPPER</span>
          <h1>Good to see you, {account.user.firstName}.</h1>
          <p>Here’s what’s happening in your next chapter.</p>
        </div>
        <Button asChild>
          <Link href="/sell">
            <Plus size={16} />
            List an item
          </Link>
        </Button>
      </div>
      <div className="stats-grid">
        {[
          ['Purchases', orders.length, '/profile/purchases'],
          ['Sales', sales.length, '/profile/sales'],
          [
            'Active listings',
            products.filter((p) => p.sellerId === account.user.id && p.status === 'Active').length,
            '/profile/listings',
          ],
          ['Conversations', account.messages.length, '/profile/messages'],
        ].map(([name, value, href]) => (
          <Link href={String(href)} className="stat" key={name}>
            <small>{name}</small>
            <strong>{value}</strong>
            <span>View details ↗</span>
          </Link>
        ))}
      </div>
      <div className="section-heading">
        <h2>Your recent activity</h2>
        <Link href="/profile/notifications">
          See all <ArrowUpRight size={16} />
        </Link>
      </div>
      {account.notifications.slice(0, 4).map((n) => (
        <Link href="/profile/notifications" className="activity-row" key={n.id}>
          <span className="activity-icon">
            <Bell size={15} />
          </span>
          <div>
            <h3>{n.title}</h3>
            <p>{n.text}</p>
          </div>
          <small>{new Date(n.createdAt).toLocaleDateString('en-CH')}</small>
        </Link>
      ))}
      <section className="section">
        <div className="section-heading">
          <h2>Saved for a second look</h2>
          <Link href="/profile/favorites">
            Your wishlist <ArrowUpRight size={16} />
          </Link>
        </div>
        <ProductGrid
          products={products
            .filter((p) => account.favorites.some((f) => f.listingId === p.id))
            .slice(0, 3)}
        />
      </section>
    </>
  );
}

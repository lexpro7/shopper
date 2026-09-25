'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import type { User, Report, Dispute, Category, Review } from '@prisma/client';
import type { Product } from '@/types';
import type { OrderRecord } from '@/types/account';
import { useMarket } from '../marketplace/provider';
import { Avatar, Badge, EmptyState, Input, Select } from '../ui/primitives';
import { Button } from '../ui/button';
import { money, titleCase } from '@/lib/utils';
export const adminSections = [
  'dashboard',
  'users',
  'listings',
  'orders',
  'payments',
  'categories',
  'reports',
  'disputes',
  'reviews',
  'promotions',
  'support',
  'analytics',
  'settings',
];
export type AdminData = {
  users: Omit<User, 'passwordHash'>[];
  listings: Product[];
  orders: OrderRecord[];
  reports: Report[];
  disputes: Dispute[];
  categories: Category[];
  reviews: Review[];
};
export function Admin({ section, data }: { section: string; data: AdminData }) {
  const { act } = useMarket(),
    router = useRouter();
  const [q, setQ] = useState('');
  const gmv = data.orders.reduce((a, o) => a + o.total, 0);
  async function moderate(entity: string, id: string, status: string) {
    try {
      await act('admin', { entity, id, status }, 'Moderation saved');
      router.refresh();
    } catch {}
  }
  let body: React.ReactNode = null;
  if (section === 'dashboard' || section === 'analytics') {
    const revenue = data.orders.reduce((a, o) => a + o.shipping, 0);
    const categoryCounts = data.categories.map((category) =>
      data.listings.filter((listing) => listing.categoryId === category.id).length,
    );
    const chartMaximum = Math.max(1, ...categoryCounts);
    body = (
      <>
        <div className="stats-grid">
          {[
            ['Demo GMV', money(gmv)],
            ['Delivery collected', money(revenue)],
            ['Members', data.users.length],
            ['Listings', data.listings.length],
            ['Orders', data.orders.length],
            ['Open disputes', data.disputes.filter((d) => d.status === 'Open').length],
          ].map(([k, v]) => (
            <div className="stat" key={k}>
              <small>{k}</small>
              <strong>{v}</strong>
              <span>Local database · Live totals</span>
            </div>
          ))}
        </div>
        <div className="panel chart-panel">
          <h2>Listings by category</h2>
          <p>Current inventory, grouped by category.</p>
          <div className="chart">
            {data.categories.map((c, index) => {
              const count = categoryCounts[index];
              return (
                <div
                  key={c.id}
                  style={{ height: `${(count / chartMaximum) * 100}%` }}
                  title={`${c.name}: ${count}`}
                >
                  <span>{c.name.split(' ')[0].slice(0, 6)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel">
          <h2>Needs a closer look</h2>
          <div className="record-row">
            <span>{data.reports.filter((r) => r.status === 'Open').length} open reports</span>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/reports">Review reports</Link>
            </Button>
          </div>
          <div className="record-row">
            <span>{data.disputes.filter((r) => r.status === 'Open').length} open disputes</span>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/disputes">Review disputes</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }
  if (section === 'users')
    body = (
      <Table headers={['Member', 'Email', 'Status', 'Joined', 'Actions']}>
        {data.users
          .filter((u) => `${u.firstName} ${u.email}`.toLowerCase().includes(q.toLowerCase()))
          .map((u) => (
            <tr key={u.id}>
              <td>
                <div className="inline-actions">
                  <Avatar name={`${u.firstName} ${u.lastName}`} />
                  <span>
                    {u.firstName} {u.lastName}
                    <small>
                      {
                        data.orders.filter((o) => o.items.some((i) => i.listing.sellerId === u.id))
                          .length
                      }{' '}
                      sales
                    </small>
                  </span>
                </div>
              </td>
              <td>{u.email}</td>
              <td>
                <Badge>{u.status}</Badge>
              </td>
              <td>{new Date(u.createdAt).toLocaleDateString('en-CH')}</td>
              <td>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={u.role === 'ADMIN'}
                  onClick={() =>
                    void moderate('users', u.id, u.status === 'Active' ? 'Suspended' : 'Active')
                  }
                >
                  {u.status === 'Active' ? 'Suspend' : 'Restore'}
                </Button>
              </td>
            </tr>
          ))}
      </Table>
    );
  if (section === 'listings' || section === 'promotions')
    body = (
      <Table headers={['Listing', 'Seller', 'Price', 'Status', 'Actions']}>
        {data.listings
          .filter(
            (p) =>
              p.title.toLowerCase().includes(q.toLowerCase()) &&
              (section !== 'promotions' || p.promoted),
          )
          .map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/listing/${p.slug}`}>{p.title}</Link>
              </td>
              <td>{p.seller.firstName}</td>
              <td>{money(p.price)}</td>
              <td>
                <Badge>{p.status}</Badge>
              </td>
              <td>
                <Select
                  aria-label={`Moderate ${p.title}`}
                  value={['Active', 'Rejected', 'Hidden'].includes(p.status) ? p.status : ''}
                  onChange={(e) => void moderate('listings', p.id, e.target.value)}
                >
                  <option value="" disabled>
                    Choose action
                  </option>
                  <option value="Active">Approve</option>
                  <option value="Rejected">Reject</option>
                  <option value="Hidden">Hide</option>
                </Select>
              </td>
            </tr>
          ))}
      </Table>
    );
  if (section === 'orders' || section === 'payments')
    body = (
      <Table headers={['Order', 'Buyer', 'Seller', 'Value', 'Status']}>
        {data.orders
          .filter((o) => o.id.toLowerCase().includes(q.toLowerCase()))
          .map((o) => (
            <tr key={o.id}>
              <td>
                {o.id}
                <small>{o.paymentMethod}</small>
              </td>
              <td>{data.users.find((u) => u.id === o.buyerId)?.firstName}</td>
              <td>{[...new Set(o.items.map((i) => i.listing.seller.firstName))].join(', ')}</td>
              <td>{money(o.total)}</td>
              <td>
                <Badge>{o.status}</Badge>
              </td>
            </tr>
          ))}
      </Table>
    );
  if (section === 'categories')
    body = (
      <Table headers={['Category', 'Subcategories', 'Listings']}>
        {data.categories
          .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
          .map((c) => (
            <tr key={c.id}>
              <td>
                <Link href={`/category/${c.slug}`}>{c.name}</Link>
              </td>
              <td>{c.subcategories.replaceAll(',', ', ')}</td>
              <td>{data.listings.filter((p) => p.categoryId === c.id).length}</td>
            </tr>
          ))}
      </Table>
    );
  if (section === 'reports' || section === 'support')
    body = data.reports.length ? (
      <Table headers={['Reporter', 'Target', 'Reason', 'Status', 'Action']}>
        {data.reports
          .filter((r) => `${r.reason} ${r.target}`.toLowerCase().includes(q.toLowerCase()))
          .map((r) => (
            <tr key={r.id}>
              <td>{data.users.find((u) => u.id === r.userId)?.firstName}</td>
              <td>{r.target}</td>
              <td>{r.reason}</td>
              <td>
                <Badge>{r.status}</Badge>
              </td>
              <td>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={r.status === 'Resolved'}
                  onClick={() => void moderate('reports', r.id, 'Resolved')}
                >
                  Resolve
                </Button>
              </td>
            </tr>
          ))}
      </Table>
    ) : (
      <EmptyState
        title="All clear"
        text="No support reports are waiting."
        href="/admin"
        action="Dashboard"
      />
    );
  if (section === 'disputes')
    body = data.disputes.length ? (
      <Table headers={['Order', 'Reason', 'Status', 'Action']}>
        {data.disputes.map((d) => (
          <tr key={d.id}>
            <td>{d.orderId}</td>
            <td>{d.reason}</td>
            <td>
              <Badge>{d.status}</Badge>
            </td>
            <td>
              <Button
                variant="outline"
                size="sm"
                disabled={d.status === 'Resolved'}
                onClick={() => void moderate('disputes', d.id, 'Resolved')}
              >
                Resolve
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    ) : (
      <EmptyState
        title="No disputes to review"
        text="Cases opened from order details appear here."
        href="/admin"
        action="Dashboard"
      />
    );
  if (section === 'reviews')
    body = (
      <Table headers={['Reviewer', 'Listing', 'Rating', 'Review']}>
        {data.reviews
          .filter((r) => r.text.toLowerCase().includes(q.toLowerCase()))
          .map((r) => (
            <tr key={r.id}>
              <td>{data.users.find((u) => u.id === r.userId)?.firstName}</td>
              <td>{data.listings.find((p) => p.id === r.listingId)?.title}</td>
              <td>{r.rating} / 5</td>
              <td>{r.text}</td>
            </tr>
          ))}
      </Table>
    );
  if (section === 'settings')
    body = (
      <div className="panel">
        <h2>Demo environment</h2>
        <dl className="specs">
          <div>
            <dt>Marketplace</dt>
            <dd>Shopper</dd>
          </div>
          <div>
            <dt>Currency</dt>
            <dd>CHF · amounts in integer rappen</dd>
          </div>
          <div>
            <dt>Database</dt>
            <dd>SQLite / Prisma</dd>
          </div>
          <div>
            <dt>Payments</dt>
            <dd>Mock confirmation only</dd>
          </div>
          <div>
            <dt>Email & SMS</dt>
            <dd>Not connected</dd>
          </div>
          <div>
            <dt>Access</dt>
            <dd>Admin role required</dd>
          </div>
        </dl>
        <p>
          Operational settings are controlled through environment variables and the application
          configuration. See README.md before deploying outside a local demo.
        </p>
        <Button asChild variant="outline">
          <Link href="/profile/settings">Personal preferences</Link>
        </Button>
      </div>
    );
  return (
    <div className="container page">
      <div className="breadcrumbs">
        <Link href="/">Marketplace</Link>›<span>Demo administration</span>
      </div>
      <div className="account-layout admin-layout">
        <aside className="account-nav">
          <div className="account-user">
            <ShieldCheck size={24} />
            <b>Shopper admin</b>
          </div>
          {adminSections.map((s) => (
            <Link
              className={s === section ? 'active' : ''}
              key={s}
              href={s === 'dashboard' ? '/admin' : `/admin/${s}`}
            >
              <LayoutDashboard size={15} />
              {titleCase(s)}
            </Link>
          ))}
        </aside>
        <div className="account-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">MARKETPLACE OPERATIONS · DEMO</span>
              <h1>{titleCase(section)}</h1>
            </div>
            {!['dashboard', 'analytics', 'settings'].includes(section) && (
              <Input
                aria-label="Search admin records"
                placeholder="Search records…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ maxWidth: 250 }}
              />
            )}
          </div>
          {body}
        </div>
      </div>
    </div>
  );
}
function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

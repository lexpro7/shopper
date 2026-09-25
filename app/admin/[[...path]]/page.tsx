import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { productInclude, serialize } from '@/lib/queries';
import { Admin } from '@/components/profile/admin';
import { EmptyState } from '@/components/ui/primitives';
const adminSections = [
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
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Demo administration' };
export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  const section = path?.[0] || 'dashboard';
  if (!adminSections.includes(section) || (path?.length || 0) > 1) notFound();
  const user = await currentUser();
  if (user?.role !== 'ADMIN')
    return (
      <div className="container page">
        <EmptyState
          title="Administrator access required"
          text="Sign in with the local Alex demo account to explore moderation."
          href="/login"
          action="Sign in"
        />
      </div>
    );
  const [users, listings, orders, reports, disputes, categories, reviews] = await Promise.all([
    db.user.findMany(),
    db.listing.findMany({ include: productInclude }),
    db.order.findMany({
      include: { items: { include: { listing: { include: productInclude } } } },
    }),
    db.report.findMany(),
    db.dispute.findMany(),
    db.category.findMany(),
    db.review.findMany(),
  ]);
  return (
    <Admin
      section={section}
      data={serialize({
        users: users.map(({ passwordHash: _, ...u }) => {
          void _;
          return u;
        }),
        listings,
        orders,
        reports,
        disputes,
        categories,
        reviews,
      })}
    />
  );
}

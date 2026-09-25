'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Tag,
  MessageCircle,
  Heart,
  Handshake,
  Gavel,
  Star,
  Bookmark,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useMarket } from '../marketplace/provider';
import { Avatar, EmptyState, Skeleton } from '../ui/primitives';
export const sections = [
  'purchases',
  'sales',
  'listings',
  'messages',
  'favorites',
  'offers',
  'auctions',
  'reviews',
  'saved-searches',
  'addresses',
  'payments',
  'notifications',
  'settings',
  'security',
];
const icons = [
  ShoppingBag,
  TrendingUp,
  Tag,
  MessageCircle,
  Heart,
  Handshake,
  Gavel,
  Star,
  Bookmark,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  ShieldCheck,
];
export function ProfileShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    { account, loading, error, refresh } = useMarket();
  if (loading)
    return (
      <div className="container page">
        <Skeleton />
      </div>
    );
  if (error)
    return (
      <div className="container page">
        <p role="alert">{error}</p>
        <button onClick={() => void refresh()}>Try again</button>
      </div>
    );
  if (!account)
    return (
      <div className="container page">
        <EmptyState
          title="Make yourself at home"
          text="Sign in to see your account."
          href="/login"
          action="Sign in"
        />
      </div>
    );
  return (
    <div className="container page">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>Your account</span>
      </div>
      <div className="account-layout">
        <aside className="account-nav">
          <div className="account-user">
            <Avatar name={`${account.user.firstName} ${account.user.lastName}`} />
            <div>
              <b>
                {account.user.firstName} {account.user.lastName}
              </b>
              <small>Verified demo member</small>
            </div>
          </div>
          <Link href="/profile" className={path === '/profile' ? 'active' : ''}>
            <LayoutDashboard size={16} />
            Overview
          </Link>
          {sections.map((s, i) => {
            const Icon = icons[i];
            return (
              <Link
                key={s}
                href={`/profile/${s}`}
                className={path.startsWith(`/profile/${s}`) ? 'active' : ''}
              >
                <Icon size={16} />
                {s.replace('-', ' ').replace(/^./, (c) => c.toUpperCase())}
              </Link>
            );
          })}
          {account.user.role === 'ADMIN' && (
            <Link href="/admin">
              <ShieldCheck size={16} />
              Demo admin
            </Link>
          )}
        </aside>
        <div className="account-content">{children}</div>
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import {
  ArrowUpRight,
  Heart,
  MessageCircle,
  ShoppingBag,
  Bell,
  Plus,
  House,
  Search,
  User,
  ChevronDown,
} from 'lucide-react';
import { SearchBar } from './search-bar';
import { useMarket } from '../marketplace/provider';
import { categories } from '@/data/seed-data';
import { BrandLogo } from './brand-logo';
import { ThemeSwitcher } from '../theme/theme-switcher';
export function Header() {
  const { account } = useMarket();
  const count = account?.cart.reduce((a, c) => a + c.quantity, 0) || 0;
  return (
    <>
      <div className="top-strip">
        <span>Good things deserve a second chapter.</span>
        <div>
          <Link href="/buyer-protection">
            A little more peace of mind <ArrowUpRight size={12} />
          </Link>
          <span>Switzerland · CHF</span>
        </div>
      </div>
      <header className="header">
        <div className="header-main container">
          <BrandLogo />
          <Link href="/categories" className="category-link">
            Categories <ChevronDown size={14} />
          </Link>
          <SearchBar />
          <Link href="/sell" className="sell-link">
            <Plus size={17} /> Sell an item
          </Link>
          <div className="header-actions">
            <ThemeSwitcher />
            <Link href="/profile/favorites" aria-label="Favorites">
              <Heart />
            </Link>
            <Link href="/profile/messages" aria-label="Messages">
              <MessageCircle />
            </Link>
            <Link href="/cart" aria-label="Shopping bag" className="bag">
              <ShoppingBag />
              {count > 0 && <b>{count}</b>}
            </Link>
            <Link href="/profile/notifications" aria-label="Notifications">
              <Bell />
            </Link>
            <Link href="/profile" aria-label="Your profile" className="user-circle">
              {account?.user.firstName[0] || 'A'}
            </Link>
          </div>
        </div>
        <nav className="category-nav container">
          <Link href="/search" className="active">
            Discover
          </Link>
          {categories.slice(0, 8).map((c) => (
            <Link key={c[0]} href={`/category/${c[0]}`}>
              {c[1]}
            </Link>
          ))}
          <Link href="/search?type=Auction">
            Auctions <ArrowUpRight size={13} />
          </Link>
        </nav>
      </header>
      <nav className="bottom-nav">
        {[
          [House, 'Home', '/'],
          [Search, 'Explore', '/search'],
          [Plus, 'Sell', '/sell'],
          [MessageCircle, 'Messages', '/profile/messages'],
          [User, 'Account', '/profile'],
        ].map(([Icon, label, href]) => {
          const I = Icon as typeof House;
          return (
            <Link href={href as string} key={label as string}>
              <I size={21} />
              <span>{label as string}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

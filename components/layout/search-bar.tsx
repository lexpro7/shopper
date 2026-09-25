'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpLeft } from 'lucide-react';
import Link from 'next/link';
import { products, categories } from '@/data/seed-data';
export function SearchBar({ large = false }: { large?: boolean }) {
  const [q, setQ] = useState(''),
    [focus, setFocus] = useState(false),
    [recent, setRecent] = useState<string[]>([]);
  const router = useRouter();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = [q, ...recent.filter((s) => s !== q)].filter(Boolean).slice(0, 4);
    localStorage.setItem('seconda-recent-searches', JSON.stringify(next));
    setFocus(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }
  return (
    <div className={`search-wrap ${large ? 'large' : ''}`}>
      <form onSubmit={submit} className="search-bar">
        <Search size={20} />
        <input
          aria-label="Search marketplace"
          placeholder="What are you looking for?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            setFocus(true);
            try {
              setRecent(JSON.parse(localStorage.getItem('seconda-recent-searches') || '[]'));
            } catch {
              setRecent([]);
            }
          }}
          onBlur={() => setTimeout(() => setFocus(false), 180)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setFocus(false);
          }}
        />
        <button aria-label="Search" type="submit">
          {large ? 'Find your next favourite' : <Search size={19} />}
        </button>
      </form>
      {focus && (
        <div className="search-suggestions">
          <small>{q ? 'SUGGESTED FINDS' : 'RECENT & POPULAR SEARCHES'}</small>
          {(q
            ? products
                .filter((p) => p[0].toLowerCase().includes(q.toLowerCase()))
                .slice(0, 4)
                .map((p) => p[0])
            : [...recent, 'Fujifilm', 'Vintage', 'MacBook'].slice(0, 5)
          ).map((s) => (
            <Link
              key={s}
              href={`/search?q=${encodeURIComponent(s)}`}
              onClick={() => setFocus(false)}
            >
              <Search size={15} />
              {s}
              <ArrowUpLeft size={14} />
            </Link>
          ))}
          <small>EXPLORE CATEGORIES</small>
          <div className="suggested-categories">
            {categories.slice(0, 4).map((c) => (
              <Link key={c[0]} href={`/category/${c[0]}`}>
                {c[1]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

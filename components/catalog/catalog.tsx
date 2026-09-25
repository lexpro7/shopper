'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from '@prisma/client';
import type { Product } from '@/types';
import { LayoutGrid, List, SlidersHorizontal, Bookmark, ArrowRight } from 'lucide-react';
import { ProductGrid } from '../marketplace/product-card';
import { useMarket } from '../marketplace/provider';
import { Button } from '../ui/button';
import { Breadcrumbs, EmptyState, Field, Input, Modal, Select } from '../ui/primitives';
export function Catalog({
  products,
  categories,
  category,
}: {
  products: Product[];
  categories: Category[];
  category?: Category;
}) {
  const params = useSearchParams(),
    router = useRouter(),
    { act } = useMarket();
  const [drawer, setDrawer] = useState(false);
  const p = new URLSearchParams(params);
  const q = p.get('q') || '';
  const cat = category?.id || p.get('category') || '';
  const view = p.get('view') || 'grid';
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.push(`${category ? `/category/${category.slug}` : '/search'}?${next.toString()}`, {
      scroll: false,
    });
  }
  const results = products.filter(
    (l) =>
      l.status === (p.get('availability') || 'Active') &&
      (!q || `${l.title} ${l.brand} ${l.description}`.toLowerCase().includes(q.toLowerCase())) &&
      (!cat || l.categoryId === cat) &&
      (!p.get('sub') || l.subcategory === p.get('sub')) &&
      (!p.get('min') || l.price >= Number(p.get('min')) * 100) &&
      (!p.get('max') || l.price <= Number(p.get('max')) * 100) &&
      (!p.get('condition') || l.condition === p.get('condition')) &&
      (!p.get('brand') || l.brand === p.get('brand')) &&
      (!p.get('rating') || l.seller.rating >= Number(p.get('rating'))) &&
      (!p.get('type') || l.listingType === p.get('type')) &&
      (!p.get('location') || l.location === p.get('location')) &&
      (!p.get('delivery') || l.delivery) &&
      (!p.get('pickup') || l.pickup),
  );
  const sort = p.get('sort') || 'recommended';
  results.sort((a, b) =>
    sort === 'low'
      ? a.price - b.price
      : sort === 'high'
        ? b.price - a.price
        : sort === 'popular'
          ? b.views - a.views
          : sort === 'ending'
            ? new Date(a.auctionEndsAt || '2099').getTime() -
              new Date(b.auctionEndsAt || '2099').getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const page = Math.max(1, Number(p.get('page')) || 1),
    pages = Math.ceil(results.length / 12);
  const filterCount = [...p.keys()].filter(
    (k) => !['q', 'sort', 'view', 'page'].includes(k),
  ).length;
  const filters = (
    <div className="filters">
      <div className="filter-heading">
        <h3>Refine your finds</h3>
        <button onClick={() => router.push(category ? `/category/${category.slug}` : '/search')}>
          Reset
        </button>
      </div>
      <Field label="Category">
        <Select
          value={cat}
          onChange={(e) => {
            if (category) router.push(`/category/${e.target.value}`);
            else update('category', e.target.value);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      {cat && (
        <Field label="Subcategory">
          <Select value={p.get('sub') || ''} onChange={(e) => update('sub', e.target.value)}>
            <option value="">All subcategories</option>
            {categories
              .find((c) => c.id === cat)
              ?.subcategories.split(',')
              .map((s) => (
                <option key={s}>{s}</option>
              ))}
          </Select>
        </Field>
      )}
      <Field label="Price range (CHF)">
        <div className="two-col">
          <Input
            aria-label="Minimum price"
            type="number"
            min="0"
            placeholder="Min"
            value={p.get('min') || ''}
            onChange={(e) => update('min', e.target.value)}
          />
          <Input
            aria-label="Maximum price"
            type="number"
            min="0"
            placeholder="Max"
            value={p.get('max') || ''}
            onChange={(e) => update('max', e.target.value)}
          />
        </div>
      </Field>
      {[
        ['condition', 'Condition', ['New', 'Like new', 'Very good', 'Good']],
        ['type', 'Buying format', ['Fixed price', 'Auction']],
        [
          'brand',
          'Brand',
          [...new Set(products.filter((l) => !cat || l.categoryId === cat).map((l) => l.brand))],
        ],
        ['location', 'Location', [...new Set(products.map((l) => l.location))]],
        ['rating', 'Seller rating', ['4', '4.5', '4.8']],
        ['availability', 'Availability', ['Active', 'Sold', 'Archived']],
      ].map(([key, label, values]) => (
        <Field key={key as string} label={label as string}>
          <Select
            value={p.get(key as string) || ''}
            onChange={(e) => update(key as string, e.target.value)}
          >
            <option value="">Any</option>
            {(values as string[]).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
      ))}
      <label className="check">
        <input
          type="checkbox"
          checked={Boolean(p.get('delivery'))}
          onChange={(e) => update('delivery', e.target.checked ? '1' : '')}
        />
        Delivery available
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={Boolean(p.get('pickup'))}
          onChange={(e) => update('pickup', e.target.checked ? '1' : '')}
        />
        Local pickup
      </label>
    </div>
  );
  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: category?.name || 'Explore the marketplace' }]} />
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>{q ? `Finds for “${q}”` : category?.name || 'A world of good finds.'}</h1>
          <p>{results.length} carefully loved things, ready for something new.</p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            void act(
              'searches',
              { name: q || category?.name || 'All finds', query: params.toString() },
              'Search saved',
            ).catch(() => {})
          }
        >
          <Bookmark size={16} />
          Save search
        </Button>
      </div>
      <div className="catalog-layout">
        <aside className="desktop-filters">{filters}</aside>
        <div className="catalog-results">
          <div className="catalog-toolbar">
            <Button className="mobile-filter" variant="outline" onClick={() => setDrawer(true)}>
              <SlidersHorizontal size={16} />
              Filters {filterCount ? `(${filterCount})` : ''}
            </Button>
            <span className="muted result-count">{results.length} finds</span>
            <div>
              <Select
                aria-label="Sort listings"
                value={sort}
                onChange={(e) => update('sort', e.target.value)}
              >
                {[
                  ['recommended', 'Recommended'],
                  ['newest', 'Newest'],
                  ['low', 'Price: Low to high'],
                  ['high', 'Price: High to low'],
                  ['popular', 'Most popular'],
                  ['ending', 'Ending soon'],
                ].map(([v, t]) => (
                  <option value={v} key={v}>
                    {t}
                  </option>
                ))}
              </Select>
              <Button
                aria-label="Grid view"
                variant={view === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => update('view', 'grid')}
              >
                <LayoutGrid size={18} />
              </Button>
              <Button
                aria-label="List view"
                variant={view === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => update('view', 'list')}
              >
                <List size={19} />
              </Button>
            </div>
          </div>
          {results.length ? (
            <div className={view === 'list' ? 'list-view' : ''}>
              <ProductGrid products={results.slice((page - 1) * 12, page * 12)} />
            </div>
          ) : (
            <EmptyState
              title="No finds this time"
              text="Try a broader search, explore another category or reset your filters."
              href="/search"
              action="Clear filters"
            />
          )}
          {pages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              {Array.from({ length: pages }, (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? 'default' : 'outline'}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set('page', String(i + 1));
                    router.push(`?${next}`);
                  }}
                >
                  {i + 1}
                </Button>
              ))}
              <ArrowRight size={16} />
            </nav>
          )}
        </div>
      </div>
      <Modal title="Find your perfect match" open={drawer} onOpenChange={setDrawer} drawer>
        {filters}
        <Button className="full" onClick={() => setDrawer(false)}>
          Show {results.length} finds
        </Button>
      </Modal>
    </div>
  );
}

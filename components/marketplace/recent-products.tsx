'use client';
import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { ProductGrid } from './product-card';
export function RecentProducts({ products }: { products: Product[] }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem('seconda-viewed') || '[]'));
    } catch {}
  }, []);
  const items = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="section-heading">
        <h2>A second look</h2>
        <span className="muted">Recently viewed</span>
      </div>
      <ProductGrid products={items.slice(0, 5)} />
    </section>
  );
}

'use client';
import Link from 'next/link';
import { Heart, MapPin, ArrowUpRight } from 'lucide-react';
import type { Product } from '@/types';
import { useMarket } from './provider';
import { ImageFallback } from './image-fallback';
import { Price } from '../ui/primitives';
export function ProductCard({ product: p }: { product: Product }) {
  const { account, favorite } = useMarket();
  const saved = account?.favorites.some((f) => f.listingId === p.id);
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link href={`/listing/${p.slug}`} aria-label={p.title}>
          <ImageFallback src={p.images[0]?.url} alt={p.title} />
        </Link>
        <button
          className={`heart ${saved ? 'saved' : ''}`}
          aria-label={`${saved ? 'Remove from' : 'Add to'} favorites: ${p.title}`}
          onClick={() => favorite(p.id)}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {p.listingType === 'Auction' ? (
          <span className="photo-badge auction">↗ Auction</span>
        ) : p.originalPrice ? (
          <span className="photo-badge">Good find</span>
        ) : null}
        {p.status !== 'Active' && <span className="sold-label">{p.status}</span>}
      </div>
      <div className="product-info">
        <div className="product-condition">
          {p.condition}
          <span>·</span>
          {p.category.name}
        </div>
        <Link href={`/listing/${p.slug}`} className="product-title">
          {p.title}
        </Link>
        <Price
          value={p.listingType === 'Auction' ? p.currentBid : p.price}
          original={p.originalPrice}
        />
        <div className="product-meta">
          <span>
            <MapPin size={12} />
            {p.location}
          </span>
          {p.listingType === 'Auction' ? (
            <span className="green">
              {p.bids.length} bids <ArrowUpRight size={12} />
            </span>
          ) : (
            <span>Buyer protection</span>
          )}
        </div>
      </div>
    </article>
  );
}
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

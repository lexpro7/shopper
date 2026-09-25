import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { db } from '@/lib/db';
import { ImageFallback } from '@/components/marketplace/image-fallback';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'All categories' };
export default async function Page() {
  const categories = await db.category.findMany({
    include: {
      listings: { take: 1, include: { images: true } },
      _count: { select: { listings: true } },
    },
  });
  return (
    <div className="container page">
      <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
      <h1>Find your kind of thing.</h1>
      <p className="lede">Ten worlds of possibility. One thoughtful marketplace.</p>
      <div className="categories-grid">
        {categories.map((c) => (
          <article className="category-card" key={c.id}>
            <Link href={`/category/${c.slug}`}>
              <div className="category-image">
                <ImageFallback src={c.listings[0]?.images[0]?.url} alt={c.name} />
              </div>
              <h2>
                {c.name}
                <ArrowUpRight size={20} />
              </h2>
              <p>{c._count.listings} finds</p>
            </Link>
            <div>
              {c.subcategories.split(',').map((s) => (
                <Link key={s} href={`/category/${c.slug}?sub=${encodeURIComponent(s)}`}>
                  {s}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

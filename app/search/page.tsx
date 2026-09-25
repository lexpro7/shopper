import { Suspense } from 'react';
import { Catalog } from '@/components/catalog/catalog';
import { db } from '@/lib/db';
import { getProducts, serialize } from '@/lib/queries';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Explore the marketplace' };
export default async function Page() {
  const [products, categories] = await Promise.all([getProducts(), db.category.findMany()]);
  return (
    <Suspense>
      <Catalog products={serialize(products)} categories={categories} />
    </Suspense>
  );
}

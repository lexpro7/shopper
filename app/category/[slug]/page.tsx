import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Catalog } from '@/components/catalog/catalog';
import { db } from '@/lib/db';
import { getProducts, serialize } from '@/lib/queries';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await db.category.findUnique({ where: { slug } });
  return { title: c?.name || 'Category not found' };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();
  const [products, categories] = await Promise.all([getProducts(), db.category.findMany()]);
  return (
    <Suspense>
      <Catalog products={serialize(products)} categories={categories} category={category} />
    </Suspense>
  );
}

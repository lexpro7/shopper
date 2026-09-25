import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getProducts, productInclude, serialize } from '@/lib/queries';
import { ListingDetail } from '@/components/listing/listing-detail';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.listing.findUnique({ where: { slug } });
  return { title: p?.title || 'Listing not found', description: p?.description.slice(0, 160) };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.listing.findUnique({ where: { slug }, include: productInclude });
  if (!p) notFound();
  const products = await getProducts();
  return (
    <ListingDetail
      product={serialize(p)}
      related={serialize(products.filter((l) => l.id !== p.id))}
    />
  );
}

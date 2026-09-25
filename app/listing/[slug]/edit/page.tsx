import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { productInclude, serialize } from '@/lib/queries';
import { ListingForm } from '@/components/listing/listing-form';
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await currentUser();
  const listing = await db.listing.findFirst({
    where: { OR: [{ id: slug }, { slug }], sellerId: user?.id || 'none' },
    include: productInclude,
  });
  if (!listing) notFound();
  return <ListingForm product={serialize(listing)} categories={await db.category.findMany()} />;
}

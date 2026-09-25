import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { productInclude, serialize } from '@/lib/queries';
import { Seller } from '@/components/marketplace/seller';
export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const seller = await db.user.findUnique({ where: { username } });
  if (!seller) notFound();
  const { passwordHash: _, ...safe } = seller;
  void _;
  return (
    <Seller
      seller={serialize(safe)}
      products={serialize(
        await db.listing.findMany({
          where: { sellerId: seller.id, status: 'Active' },
          include: productInclude,
        }),
      )}
    />
  );
}

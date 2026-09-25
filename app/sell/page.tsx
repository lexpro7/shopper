import { db } from '@/lib/db';
import { ListingForm } from '@/components/listing/listing-form';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sell something good' };
export default async function Page() {
  return <ListingForm categories={await db.category.findMany()} />;
}

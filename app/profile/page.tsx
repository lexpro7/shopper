import { getProducts, serialize } from '@/lib/queries';
import { Overview } from '@/components/profile/overview';
export const dynamic = 'force-dynamic';
export default async function Page() {
  return <Overview products={serialize(await getProducts())} />;
}

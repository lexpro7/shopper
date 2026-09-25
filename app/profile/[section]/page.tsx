import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProducts, serialize } from '@/lib/queries';
import { Collections } from '@/components/profile/collections';
import { Orders } from '@/components/profile/orders';
import { Messages } from '@/components/profile/messages';
import { Settings } from '@/components/profile/settings';
const sections = [
  'purchases',
  'sales',
  'listings',
  'messages',
  'favorites',
  'offers',
  'auctions',
  'reviews',
  'saved-searches',
  'addresses',
  'payments',
  'notifications',
  'settings',
  'security',
];
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  if (section === 'purchases' || section === 'sales') return <Orders sales={section === 'sales'} />;
  if (section === 'messages')
    return (
      <Suspense>
        <Messages />
      </Suspense>
    );
  if (['addresses', 'payments', 'settings', 'security'].includes(section))
    return <Settings section={section} />;
  return <Collections section={section} products={serialize(await getProducts())} />;
}

import { Orders } from '@/components/profile/orders';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Orders id={(await params).id} />;
}

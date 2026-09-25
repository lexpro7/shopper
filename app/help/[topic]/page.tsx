import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/marketplace/content-page';
import { helpTopics } from '@/data/content';
export default async function Page({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  if (!helpTopics.some((t) => t.toLowerCase() === topic)) notFound();
  return <ContentPage slug="help" topic={topic} />;
}

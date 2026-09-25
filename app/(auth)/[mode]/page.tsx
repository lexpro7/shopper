import { notFound } from 'next/navigation';
import { AuthForm } from '@/components/profile/auth-form';
import { ContentPage } from '@/components/marketplace/content-page';
import { articles } from '@/data/content';
import { titleCase } from '@/lib/utils';
const modes = ['login', 'register', 'forgot-password', 'reset-password', 'verify-email'];
export async function generateMetadata({ params }: { params: Promise<{ mode: string }> }) {
  return { title: titleCase((await params).mode) };
}
export default async function Page({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  if (modes.includes(mode)) return <AuthForm mode={mode} />;
  if (articles[mode] || ['help', 'contact', 'report'].includes(mode))
    return <ContentPage slug={mode} />;
  notFound();
}

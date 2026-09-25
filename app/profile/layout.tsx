import { ProfileShell } from '@/components/profile/profile-shell';
export const metadata = { title: 'Your account' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProfileShell>{children}</ProfileShell>;
}

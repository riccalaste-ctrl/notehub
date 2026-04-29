import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect('/');
  }

  return <>{children}</>;
}

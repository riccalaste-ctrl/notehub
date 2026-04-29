import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('notehub_admin_jwt');

  if (!adminToken) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}

import { NextResponse } from 'next/server';
import { requireAdmin, getUserFromToken } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = await getUserFromToken();
  if (!admin || admin.role !== 'admin' || !admin.email) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  await logAuditEvent({
    actor_email: admin.email,
    action: 'ADMIN_SECTION_ACCESS',
    target_type: 'admin_section',
  });

  return NextResponse.json({ success: true });
}

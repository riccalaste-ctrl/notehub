import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authResponse = await requireAdmin();
  if (authResponse) return authResponse;

  const { data: body } = await request.json().catch(() => ({}) as any);
  const dryRun = body?.dryRun !== false;

  const results: Record<string, { deleted: number; error?: string }> = {};

  // Only clean expired upload sessions (orphaned, never completed)
  // NEVER delete: uploads, drive connections, audit logs, owner info
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    if (!dryRun) {
      const { data: deleted, error } = await supabaseAdmin
        .from('drive_upload_sessions')
        .delete()
        .eq('status', 'pending')
        .lt('expires_at', cutoff)
        .select('id');
      if (error) throw error;
      results.expired_pending_sessions = { deleted: deleted?.length || 0 };
    } else {
      const { count, error } = await supabaseAdmin
        .from('drive_upload_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('expires_at', cutoff);
      if (error) throw error;
      results.expired_pending_sessions = { deleted: count || 0 };
    }
  } catch (e: any) {
    results.expired_pending_sessions = { deleted: 0, error: e.message };
  }

  // Clean failed sessions older than 48h (not completed ones - those have real uploads)
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    if (!dryRun) {
      const { data: deleted, error } = await supabaseAdmin
        .from('drive_upload_sessions')
        .delete()
        .in('status', ['failed', 'expired'])
        .lt('created_at', cutoff)
        .select('id');
      if (error) throw error;
      results.old_failed_sessions = { deleted: deleted?.length || 0 };
    } else {
      const { count, error } = await supabaseAdmin
        .from('drive_upload_sessions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['failed', 'expired'])
        .lt('created_at', cutoff);
      if (error) throw error;
      results.old_failed_sessions = { deleted: count || 0 };
    }
  } catch (e: any) {
    results.old_failed_sessions = { deleted: 0, error: e.message };
  }

  return NextResponse.json({
    success: true,
    dryRun,
    results,
    totalDeletable: Object.values(results).reduce((sum, r) => sum + r.deleted, 0),
    message: dryRun
      ? 'Analisi completata. Passa dryRun: false per eseguire la pulizia.'
      : 'Pulizia completata. Solo sessioni orphan/fallite sono state rimosse.',
  });
}

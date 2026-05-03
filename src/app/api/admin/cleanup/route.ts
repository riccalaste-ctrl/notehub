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

  // 1. Clean expired upload sessions (older than 24h)
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    if (!dryRun) {
      const { data: deleted, error } = await supabaseAdmin
        .from('drive_upload_sessions')
        .delete()
        .lt('expires_at', cutoff)
        .select('id');
      if (error) throw error;
      results.expired_sessions = { deleted: deleted?.length || 0 };
    } else {
      const { count, error } = await supabaseAdmin
        .from('drive_upload_sessions')
        .select('*', { count: 'exact', head: true })
        .lt('expires_at', cutoff);
      if (error) throw error;
      results.expired_sessions = { deleted: count || 0 };
    }
  } catch (e: any) {
    results.expired_sessions = { deleted: 0, error: e.message };
  }

  // 2. Clean old completed sessions (older than 7 days)
  try {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    if (!dryRun) {
      const { data: deleted, error } = await supabaseAdmin
        .from('drive_upload_sessions')
        .delete()
        .eq('status', 'completed')
        .lt('created_at', cutoff)
        .select('id');
      if (error) throw error;
      results.completed_sessions_old = { deleted: deleted?.length || 0 };
    } else {
      const { count, error } = await supabaseAdmin
        .from('drive_upload_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .lt('created_at', cutoff);
      if (error) throw error;
      results.completed_sessions_old = { deleted: count || 0 };
    }
  } catch (e: any) {
    results.completed_sessions_old = { deleted: 0, error: e.message };
  }

  // 3. Clean failed/expired sessions older than 48h
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
      results.failed_sessions_old = { deleted: deleted?.length || 0 };
    } else {
      const { count, error } = await supabaseAdmin
        .from('drive_upload_sessions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['failed', 'expired'])
        .lt('created_at', cutoff);
      if (error) throw error;
      results.failed_sessions_old = { deleted: count || 0 };
    }
  } catch (e: any) {
    results.failed_sessions_old = { deleted: 0, error: e.message };
  }

  // 4. Clean old audit logs (older than 30 days)
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    if (!dryRun) {
      const { data: deleted, error } = await supabaseAdmin
        .from('audit_logs')
        .delete()
        .lt('created_at', cutoff)
        .select('id');
      if (error) throw error;
      results.old_audit_logs = { deleted: deleted?.length || 0 };
    } else {
      const { count, error } = await supabaseAdmin
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', cutoff);
      if (error) throw error;
      results.old_audit_logs = { deleted: count || 0 };
    }
  } catch (e: any) {
    results.old_audit_logs = { deleted: 0 };
  }

  return NextResponse.json({
    success: true,
    dryRun,
    results,
    totalDeletable: Object.values(results).reduce((sum, r) => sum + r.deleted, 0),
    message: dryRun
      ? 'Dry run completed. Pass dryRun: false to actually delete.'
      : 'Cleanup completed.',
  });
}

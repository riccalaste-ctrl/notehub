import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authResponse = await requireAdmin();
  if (authResponse) return authResponse;

  const { data: body } = await request.json().catch(() => ({}) as any);
  const dryRun = body?.dryRun !== false;
  const deep = body?.deep === true;

  const results: Record<string, { deleted: number; error?: string }> = {};

  // SAFE CLEANUP (always runs):
  // 1. Expired pending sessions older than 24h (orphaned, never completed)
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

  // 2. Failed sessions older than 48h
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

  // DEEP CLEANUP (only when admin explicitly requests with deep: true):
  // 3. Audit logs older than 30 days
  if (deep) {
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
      results.old_audit_logs = { deleted: 0, error: e.message };
    }

    // 4. Completed upload sessions older than 7 days (metadata only, NOT the actual uploads)
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
        results.old_completed_sessions = { deleted: deleted?.length || 0 };
      } else {
        const { count, error } = await supabaseAdmin
          .from('drive_upload_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .lt('created_at', cutoff);
        if (error) throw error;
        results.old_completed_sessions = { deleted: count || 0 };
      }
    } catch (e: any) {
      results.old_completed_sessions = { deleted: 0, error: e.message };
    }
  }

  return NextResponse.json({
    success: true,
    dryRun,
    deep,
    results,
    totalDeletable: Object.values(results).reduce((sum, r) => sum + r.deleted, 0),
    message: dryRun
      ? 'Analisi completata. Aggiungi deep: true per pulizia completa e dryRun: false per eseguire.'
      : 'Pulizia completata.',
  });
}

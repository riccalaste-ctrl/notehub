import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const auditCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const pendingCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const failedCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const completedCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [audit, pending, failed, completed] = await Promise.all([
    supabaseAdmin.from('audit_logs').delete().lt('created_at', auditCutoff).select('id'),
    supabaseAdmin.from('drive_upload_sessions').delete().eq('status', 'pending').lt('expires_at', pendingCutoff).select('id'),
    supabaseAdmin.from('drive_upload_sessions').delete().in('status', ['failed', 'expired']).lt('created_at', failedCutoff).select('id'),
    supabaseAdmin.from('drive_upload_sessions').delete().eq('status', 'completed').lt('created_at', completedCutoff).select('id'),
  ]);

  if (audit.error || pending.error || failed.error || completed.error) {
    console.error('[cron cleanup]', { audit: audit.error, pending: pending.error, failed: failed.error, completed: completed.error });
    return NextResponse.json({ error: 'Pulizia automatica non completata' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    retentionDays: 90,
    deleted: {
      auditLogs: audit.data?.length || 0,
      pendingSessions: pending.data?.length || 0,
      failedSessions: failed.data?.length || 0,
      completedSessions: completed.data?.length || 0,
    },
    executedAt: new Date().toISOString(),
  });
}

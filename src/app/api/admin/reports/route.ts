import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { deleteFileFromDrive } from '@/lib/google-drive';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { data, error } = await supabaseAdmin.from('reports').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: 'Impossibile leggere le segnalazioni.' }, { status: 500 });

  const uploadIds = Array.from(new Set((data || []).map((report) => report.upload_id).filter(Boolean)));
  let uploads: Record<string, any> = {};
  if (uploadIds.length) {
    const { data: uploadRows } = await supabaseAdmin
      .from('uploads')
      .select('id, original_filename, uploader_name, view_url, download_url, drive_file_id, professor_id')
      .in('id', uploadIds);
    uploads = Object.fromEntries((uploadRows || []).map((row) => [row.id, row]));
  }

  return NextResponse.json({ reports: (data || []).map((report) => ({ ...report, upload: uploads[report.upload_id] || null })) });
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  const action = body?.action === 'remove' ? 'remove' : body?.action === 'dismiss' ? 'dismiss' : null;
  if (!id || !action) return NextResponse.json({ error: 'Operazione non valida.' }, { status: 400 });

  const adminEmail = process.env.ADMIN_EMAIL?.trim() || 'admin@notehub.local';
  const { data: report, error } = await supabaseAdmin.from('reports').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: 'Segnalazione non trovata.' }, { status: 404 });

  if (action === 'remove') {
    const { data: upload } = await supabaseAdmin.from('uploads').select('drive_file_id, professor_id').eq('id', report.upload_id).maybeSingle();
    if (upload?.drive_file_id && upload.professor_id) {
      try { await deleteFileFromDrive(upload.professor_id, upload.drive_file_id); } catch (driveError) { console.warn('[reports] Drive deletion failed', driveError); }
    }
    await supabaseAdmin.from('uploads').delete().eq('id', report.upload_id);
  }

  const { error: updateError } = await supabaseAdmin.from('reports').update({
    status: action === 'remove' ? 'resolved_removed' : 'dismissed',
    reviewed_at: new Date().toISOString(),
    reviewed_by: adminEmail,
  }).eq('id', id);

  if (updateError) return NextResponse.json({ error: 'Impossibile aggiornare la segnalazione.' }, { status: 500 });

  await logAuditEvent({
    actor_email: adminEmail,
    action: action === 'remove' ? 'REPORT_RESOLVED_REMOVED' : 'REPORT_DISMISSED',
    target_type: 'report',
    target_id: id,
    metadata: { upload_id: report.upload_id, file_name: report.file_name, uploader_name: report.uploader_name },
  });

  return NextResponse.json({ success: true });
}

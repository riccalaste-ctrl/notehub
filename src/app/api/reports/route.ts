import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedUserFromRequest } from '@/lib/user-session';
import { getModerationState } from '@/lib/moderation';
import { consumeRateLimit } from '@/lib/rate-limit';
import { sendReportEmail } from '@/lib/report-email';
import { isPreviewMode } from '@/lib/preview-data';

export const dynamic = 'force-dynamic';

const schema = z.object({
  uploadId: z.string().uuid(),
  reason: z.string().trim().min(5).max(1000),
});

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 401 });

  const limit = consumeRateLimit(request, 'report', { limit: 5, windowMs: 60 * 60 * 1000, identity: user.id });
  if (limit.limited) {
    return NextResponse.json({ error: 'Hai inviato troppe segnalazioni. Riprova più tardi.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
  }

  if (!isPreviewMode) {
    const moderation = await getModerationState(user.email);
    if (moderation.blocked) return NextResponse.json({ error: 'Questo account non può inviare segnalazioni.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validation = schema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: 'Motivo della segnalazione non valido.' }, { status: 400 });

  if (isPreviewMode) return NextResponse.json({ success: true, preview: true });

  const { data: upload, error: uploadError } = await supabaseAdmin
    .from('uploads')
    .select('id, original_filename, uploader_name, owner_id, view_url, download_url')
    .eq('id', validation.data.uploadId)
    .maybeSingle();

  if (uploadError) return NextResponse.json({ error: 'Documento non disponibile.' }, { status: 500 });
  if (!upload) return NextResponse.json({ error: 'Documento non trovato.' }, { status: 404 });

  const { data: setting } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'reports_email')
    .maybeSingle();
  const recipient = setting?.value?.trim().toLowerCase();
  if (!recipient) return NextResponse.json({ error: 'Email per le segnalazioni non configurata dall’Admin.' }, { status: 503 });

  let uploaderEmail = 'Email non disponibile';
  if (upload.owner_id) {
    const { data: uploaderUser, error: uploaderError } = await supabaseAdmin.auth.admin.getUserById(upload.owner_id);
    if (!uploaderError && uploaderUser?.user?.email) {
      uploaderEmail = uploaderUser.user.email;
    }
  }

  const { data: report, error: insertError } = await supabaseAdmin
    .from('reports')
    .insert({
      upload_id: upload.id,
      reporter_email: user.email || 'unknown',
      reason: validation.data.reason,
      file_name: upload.original_filename,
      uploader_name: upload.uploader_name || 'Nome non disponibile',
      file_view_url: upload.view_url || '',
      file_download_url: upload.download_url || '',
    })
    .select('id')
    .single();

  if (insertError) return NextResponse.json({ error: 'Impossibile registrare la segnalazione.' }, { status: 500 });

  try {
    await sendReportEmail({
      to: recipient,
      reporterEmail: user.email || 'unknown',
      fileName: upload.original_filename,
      uploaderName: upload.uploader_name || 'Nome non disponibile',
      uploaderEmail,
      reason: validation.data.reason,
      viewUrl: upload.view_url || '',
      downloadUrl: upload.download_url || '',
    });
    await supabaseAdmin.from('reports').update({ email_sent_at: new Date().toISOString(), email_error: null }).eq('id', report.id);
    return NextResponse.json({ success: true, emailSent: true });
  } catch (emailError) {
    const message = emailError instanceof Error ? emailError.message : 'Invio email non riuscito';
    await supabaseAdmin.from('reports').update({ email_error: message }).eq('id', report.id);
    return NextResponse.json({ success: true, emailSent: false, warning: 'Segnalazione salvata, ma l’email non è stata inviata.' }, { status: 202 });
  }
}

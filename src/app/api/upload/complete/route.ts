import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import {
  DriveNotConnectedError,
  getAuthorizedDriveForProfessor,
  verifyAndShareDriveFile,
} from '@/lib/google-drive';
import { getAuthenticatedUserFromRequest } from '@/lib/user-session';
import { logFileUpload } from '@/lib/audit-logger';

export const dynamic = 'force-dynamic';

const completeUploadSchema = z.object({
  sessionId: z.string().uuid(),
  driveFileId: z.string().min(1).max(256),
});

function getPublicDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?id=${encodeURIComponent(fileId)}&export=download`;
}

function getPublicViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view?usp=sharing`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const validation = completeUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dati completamento upload non validi', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { sessionId, driveFileId } = validation.data;

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('drive_upload_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('status', 'pending')
      .maybeSingle();

    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Sessione upload non trovata o già completata' }, { status: 404 });
    }
    if (session.owner_id && session.owner_id !== user.id) {
      return NextResponse.json({ error: 'Sessione upload non valida per questo utente' }, { status: 403 });
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      await supabaseAdmin
        .from('drive_upload_sessions')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      return NextResponse.json({ error: 'Sessione upload scaduta. Riprova.' }, { status: 400 });
    }

    const authorized = await getAuthorizedDriveForProfessor(session.professor_id);
    const driveFile = await verifyAndShareDriveFile(
      authorized.auth,
      driveFileId,
      session.drive_folder_id,
      Number(session.size_bytes)
    );

    const { data: upload, error: insertError } = await supabaseAdmin
      .from('uploads')
      .insert({
        subject_id: session.subject_id,
        professor_id: session.professor_id,
        owner_id: session.owner_id || user.id,
        original_filename: session.original_filename,
        drive_file_id: driveFileId,
        drive_folder_id: session.drive_folder_id,
        drive_connection_id: session.drive_connection_id,
        download_url: getPublicDownloadUrl(driveFileId),
        view_url: getPublicViewUrl(driveFileId),
        mime_type: driveFile.mimeType || session.mime_type,
        size_bytes: Number(driveFile.size || session.size_bytes),
        uploader_name: session.uploader_name || null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await supabaseAdmin
      .from('drive_upload_sessions')
      .update({
        status: 'completed',
        drive_file_id: driveFileId,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    // Log the file upload
    await logFileUpload(
      user.email || 'unknown',
      driveFileId,
      session.original_filename,
      Number(driveFile.size || session.size_bytes)
    );

    return NextResponse.json({ success: true, upload });
  } catch (error) {
    if (error instanceof DriveNotConnectedError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Complete upload error:', error);
    return NextResponse.json(
      { error: 'Impossibile completare il salvataggio del file' },
      { status: 500 }
    );
  }
}

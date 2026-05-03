import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { encryptSecret } from '@/lib/secure-tokens';
import {
  createResumableUploadSession,
  DriveNotConnectedError,
  getAuthorizedDriveForProfessor,
  getOrCreateSubjectFolder,
  getUploadSessionExpiry,
  isAllowedUploadMimeType,
  MAX_UPLOAD_SIZE_BYTES,
  sanitizeDriveFileName,
  verifyAndShareDriveFile,
  getDriveDownloadUrl,
  getDriveViewUrl,
} from '@/lib/google-drive';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const metadataSchema = z.object({
  subjectId: z.string().uuid(),
  professorId: z.string().uuid(),
  uploaderName: z.string().max(100).optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'File mancante' }, { status: 400 });
    }

    const subjectId = formData.get('subjectId') as string;
    const professorId = formData.get('professorId') as string;
    const uploaderName = (formData.get('uploaderName') as string) || '';

    const validation = metadataSchema.safeParse({ subjectId, professorId, uploaderName });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dati upload non validi', details: validation.error.errors },
        { status: 400 }
      );
    }

    if (!isAllowedUploadMimeType(file.type)) {
      return NextResponse.json(
        { error: 'Tipo file non consentito. Permessi: PDF, DOC, DOCX, JPG, PNG' },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File troppo grande. Dimensione massima consentita' },
        { status: 400 }
      );
    }

    const { data: subject } = await supabaseAdmin
      .from('subjects')
      .select('id, name, enabled')
      .eq('id', subjectId)
      .eq('enabled', true)
      .maybeSingle();

    if (!subject) {
      return NextResponse.json({ error: 'Materia non trovata o disattivata' }, { status: 404 });
    }

    const { data: association } = await supabaseAdmin
      .from('subject_professors')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('professor_id', professorId)
      .maybeSingle();

    if (!association) {
      return NextResponse.json(
        { error: 'Materia non associata a questo professore' },
        { status: 400 }
      );
    }

    const authorized = await getAuthorizedDriveForProfessor(professorId);
    const folderId = await getOrCreateSubjectFolder({
      professorId,
      subjectId,
      subjectName: subject.name,
      authorized,
    });

    const uploadUrl = await createResumableUploadSession({
      accessToken: authorized.accessToken,
      folderId,
      filename: sanitizeDriveFileName(file.name),
      mimeType: file.type,
      sizeBytes: file.size,
    });

    const expiresAt = getUploadSessionExpiry();
    const { data: uploadSession, error: insertError } = await supabaseAdmin
      .from('drive_upload_sessions')
      .insert({
        professor_id: professorId,
        subject_id: subjectId,
        drive_connection_id: authorized.connection.id,
        drive_folder_id: folderId,
        original_filename: sanitizeDriveFileName(file.name),
        mime_type: file.type,
        size_bytes: file.size,
        uploader_name: uploaderName || null,
        upload_uri_encrypted: encryptSecret(uploadUrl),
        status: 'pending',
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (!uploadSession || insertError) {
      throw insertError || new Error('Failed to create upload session');
    }

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Content-Length': String(file.size),
      },
      body: file.stream(),
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error('Google Drive upload failed:', uploadRes.status, errorText);
      return NextResponse.json(
        { error: `Upload fallito su Google Drive (${uploadRes.status})` },
        { status: 500 }
      );
    }

    let uploadJson: Record<string, unknown> | null = null;
    try {
      uploadJson = await uploadRes.json();
    } catch {
      // Google may return empty body for resumable final upload
    }

    const driveFileId = (uploadJson as { id?: string } | null)?.id;
    if (!driveFileId) {
      return NextResponse.json(
        { error: 'Impossibile ottenere ID del file da Google Drive' },
        { status: 500 }
      );
    }

    const driveFile = await verifyAndShareDriveFile(
      authorized.auth,
      driveFileId,
      folderId,
      file.size
    );

    const { data: upload } = await supabaseAdmin
      .from('uploads')
      .insert({
        subject_id: subjectId,
        professor_id: professorId,
        original_filename: sanitizeDriveFileName(file.name),
        drive_file_id: driveFileId,
        drive_folder_id: folderId,
        drive_connection_id: authorized.connection.id,
        download_url: driveFile.webContentLink || getDriveDownloadUrl(driveFileId),
        view_url: driveFile.webViewLink || getDriveViewUrl(driveFileId),
        mime_type: driveFile.mimeType || file.type,
        size_bytes: Number(driveFile.size || file.size),
        uploader_name: uploaderName || null,
      })
      .select()
      .single();

    await supabaseAdmin
      .from('drive_upload_sessions')
      .update({
        status: 'completed',
        drive_file_id: driveFileId,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', uploadSession.id);

    return NextResponse.json({ success: true, upload });
  } catch (error) {
    if (error instanceof DriveNotConnectedError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error('Direct upload error:', { message, stack: error instanceof Error ? error.stack : undefined });

    if (message.includes('not found') || message.includes('404')) {
      return NextResponse.json(
        { error: 'Cartella Drive non trovata. Ricollega Google Drive dal pannello admin.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Impossibile completare il caricamento del file' },
      { status: 500 }
    );
  }
}

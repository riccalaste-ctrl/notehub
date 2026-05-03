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
} from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

const uploadSessionSchema = z.object({
  subjectId: z.string().uuid(),
  professorId: z.string().uuid(),
  uploaderName: z.string().max(100).optional().or(z.literal('')),
  originalFilename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(160),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = uploadSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dati upload non validi', details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      subjectId,
      professorId,
      uploaderName,
      originalFilename,
      mimeType,
      sizeBytes,
    } = validation.data;

    if (!isAllowedUploadMimeType(mimeType)) {
      return NextResponse.json(
        { error: 'Tipo file non consentito. Permessi: PDF, DOC, DOCX, JPG, PNG' },
        { status: 400 }
      );
    }

    const { data: subject, error: subjectError } = await supabaseAdmin
      .from('subjects')
      .select('id, name, enabled')
      .eq('id', subjectId)
      .eq('enabled', true)
      .maybeSingle();

    if (subjectError) throw subjectError;
    if (!subject) {
      return NextResponse.json({ error: 'Materia non trovata o disattivata' }, { status: 404 });
    }

    const { data: association, error: associationError } = await supabaseAdmin
      .from('subject_professors')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('professor_id', professorId)
      .maybeSingle();

    if (associationError) throw associationError;
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
      filename: sanitizeDriveFileName(originalFilename),
      mimeType,
      sizeBytes,
    });

    const expiresAt = getUploadSessionExpiry();
    const { data: uploadSession, error: insertError } = await supabaseAdmin
      .from('drive_upload_sessions')
      .insert({
        professor_id: professorId,
        subject_id: subjectId,
        drive_connection_id: authorized.connection.id,
        drive_folder_id: folderId,
        original_filename: sanitizeDriveFileName(originalFilename),
        mime_type: mimeType,
        size_bytes: sizeBytes,
        uploader_name: uploaderName || null,
        upload_uri_encrypted: encryptSecret(uploadUrl),
        status: 'pending',
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      sessionId: uploadSession.id,
      uploadUrl,
      expiresAt,
    });
  } catch (error) {
    if (error instanceof DriveNotConnectedError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error('Create upload session error:', { message, stack: error instanceof Error ? error.stack : undefined });

    if (message.includes('not found') || message.includes('404')) {
      return NextResponse.json(
        { error: 'Cartella Drive non trovata. Ricollega Google Drive dal pannello admin.' },
        { status: 400 }
      );
    }

    if (message.includes('permission') || message.includes('403')) {
      return NextResponse.json(
        { error: 'Permessi Drive insufficienti. Ricollega Google Drive dal pannello admin.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Impossibile creare la sessione di upload Drive' },
      { status: 500 }
    );
  }
}

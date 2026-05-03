import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { encryptSecret } from '@/lib/secure-tokens';
import {
  DriveNotConnectedError,
  getAuthorizedDriveForProfessor,
  getOrCreateSubjectFolder,
  isAllowedUploadMimeType,
  MAX_UPLOAD_SIZE_BYTES,
  sanitizeDriveFileName,
} from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

const schema = z.object({
  subjectId: z.string().uuid(),
  professorId: z.string().uuid(),
  uploaderName: z.string().max(100).optional().or(z.literal('')),
  originalFilename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(160),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
});

export async function POST(request: NextRequest) {
  try {
    console.log('[upload/session] Starting...');
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      console.error('[upload/session] Validation failed:', validation.error.errors);
      return NextResponse.json(
        { error: 'Dati upload non validi', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { subjectId, professorId, uploaderName, originalFilename, mimeType, sizeBytes } = validation.data;
    console.log('[upload/session] Validated:', { subjectId, professorId, originalFilename, mimeType, sizeBytes });

    if (!isAllowedUploadMimeType(mimeType)) {
      return NextResponse.json(
        { error: 'Tipo file non consentito. Permessi: PDF, DOC, DOCX, JPG, PNG' },
        { status: 400 }
      );
    }

    console.log('[upload/session] Checking subject...');
    const { data: subject, error: subjectError } = await supabaseAdmin
      .from('subjects')
      .select('id, name, enabled')
      .eq('id', subjectId)
      .eq('enabled', true)
      .maybeSingle();

    if (subjectError) {
      console.error('[upload/session] Subject error:', subjectError);
      throw subjectError;
    }
    if (!subject) {
      return NextResponse.json({ error: 'Materia non trovata o disattivata' }, { status: 404 });
    }
    console.log('[upload/session] Subject OK:', subject.name);

    console.log('[upload/session] Checking association...');
    const { data: association, error: assocError } = await supabaseAdmin
      .from('subject_professors')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('professor_id', professorId)
      .maybeSingle();

    if (assocError) {
      console.error('[upload/session] Association error:', assocError);
      throw assocError;
    }
    if (!association) {
      return NextResponse.json(
        { error: 'Materia non associata a questo professore' },
        { status: 400 }
      );
    }

    console.log('[upload/session] Authorizing Drive...');
    const authorized = await getAuthorizedDriveForProfessor(professorId);
    console.log('[upload/session] Drive authorized, Google email:', authorized.connection.google_email);

    console.log('[upload/session] Getting folder...');
    const folderId = await getOrCreateSubjectFolder({
      professorId,
      subjectId,
      subjectName: subject.name,
      authorized,
    });
    console.log('[upload/session] Folder ID:', folderId);

    console.log('[upload/session] Creating resumable session...');
    const resumableRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,webViewLink,webContentLink,parents',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authorized.accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': String(sizeBytes),
        },
        body: JSON.stringify({
          name: sanitizeDriveFileName(originalFilename),
          mimeType,
          parents: [folderId],
        }),
      }
    );

    if (!resumableRes.ok) {
      const errText = await resumableRes.text();
      console.error('[upload/session] Google resumable creation FAILED:', {
        status: resumableRes.status,
        error: errText.slice(0, 500),
      });
      return NextResponse.json(
        { error: `Impossibile creare sessione Google (${resumableRes.status})` },
        { status: 500 }
      );
    }

    const uploadUrl = resumableRes.headers.get('location');
    if (!uploadUrl) {
      console.error('[upload/session] No upload URL in Google response');
      return NextResponse.json({ error: 'Google non ha restituito un URL di upload' }, { status: 500 });
    }
    console.log('[upload/session] Upload URL received');

    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    console.log('[upload/session] Saving session to DB...');
    const { data: session, error: insertError } = await supabaseAdmin
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

    if (!session || insertError) {
      console.error('[upload/session] DB insert error:', insertError);
      throw insertError || new Error('Failed to create session');
    }
    console.log('[upload/session] Session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      expiresAt,
    });
  } catch (error) {
    if (error instanceof DriveNotConnectedError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error('Create upload session error:', { message });

    if (message.includes('not found') || message.includes('404')) {
      return NextResponse.json(
        { error: 'Cartella Drive non trovata. Ricollega Google Drive dal pannello admin.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Impossibile creare la sessione di upload Drive' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedUserFromRequest } from '@/lib/user-session';
import { getAuthorizedDriveForProfessor, verifyDriveFile } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 401 });
  }

  const { id } = await params;
  const { data: upload, error } = await supabaseAdmin
    .from('uploads')
    .select('id, original_filename, drive_file_id, drive_folder_id, professor_id, mime_type, size_bytes')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[private-file] Upload lookup failed:', error);
    return NextResponse.json({ error: 'Impossibile recuperare il documento' }, { status: 500 });
  }

  if (!upload || !upload.drive_file_id || !upload.professor_id || !upload.drive_folder_id) {
    return NextResponse.json({ error: 'Documento non trovato' }, { status: 404 });
  }

  try {
    const authorized = await getAuthorizedDriveForProfessor(upload.professor_id);

    // Verifies that this Drive file belongs to the expected subject folder and
    // removes any legacy "anyone with the link" permission before serving it.
    const driveFile = await verifyDriveFile(
      authorized.auth,
      upload.drive_file_id,
      upload.drive_folder_id,
      Number(upload.size_bytes)
    );

    const upstreamHeaders: Record<string, string> = {
      Authorization: `Bearer ${authorized.accessToken}`,
    };
    const range = request.headers.get('range');
    if (range) upstreamHeaders.Range = range;

    const upstream = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(upload.drive_file_id)}?alt=media`,
      { headers: upstreamHeaders, cache: 'no-store' }
    );

    if (!upstream.ok || !upstream.body) {
      console.error('[private-file] Google Drive download failed:', upstream.status);
      return NextResponse.json(
        { error: upstream.status === 404 ? 'Documento non trovato' : 'Documento temporaneamente non disponibile' },
        { status: upstream.status === 404 ? 404 : 502 }
      );
    }

    const download = new URL(request.url).searchParams.get('download') === '1';
    const safeName = upload.original_filename.replace(/[\r\n"]/g, '_');
    const fallbackName = safeName.replace(/[^\x20-\x7E]/g, '_');
    const disposition = download ? 'attachment' : 'inline';
    const headers = new Headers({
      'Content-Type': driveFile.mimeType || upload.mime_type || 'application/octet-stream',
      'Content-Disposition': `${disposition}; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Cookie',
    });

    for (const header of ['content-length', 'content-range', 'accept-ranges']) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error('[private-file] Secure file delivery failed:', error);
    return NextResponse.json(
      { error: 'Impossibile aprire il documento. Riprova o contatta l’amministratore.' },
      { status: 502 }
    );
  }
}

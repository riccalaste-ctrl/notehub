import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { decryptSecret } from '@/lib/secure-tokens';
import { getAuthenticatedUserFromRequest } from '@/lib/user-session';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 401 });
    }

    const formData = await request.formData();

    const sessionId = formData.get('sessionId') as string;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string, 10);
    const totalChunks = parseInt(formData.get('totalChunks') as string, 10);
    const chunk = formData.get('chunk') as File;

    console.log('[upload/chunk] Received:', { sessionId, chunkIndex, totalChunks, chunkSize: chunk?.size, chunkName: chunk?.name, chunkType: chunk?.type });

    if (!sessionId || isNaN(chunkIndex) || isNaN(totalChunks) || !chunk) {
      console.error('[upload/chunk] Invalid parameters:', { sessionId, chunkIndex, totalChunks, hasChunk: !!chunk });
      return NextResponse.json({ error: 'Dati chunk non validi' }, { status: 400 });
    }

    console.log('[upload/chunk] Fetching session from Supabase...');
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('drive_upload_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('status', 'pending')
      .maybeSingle();

    if (sessionError) {
      console.error('[upload/chunk] Supabase session fetch error:', sessionError);
      return NextResponse.json({ error: 'Errore nel recupero della sessione' }, { status: 500 });
    }

    if (!session) {
      console.error('[upload/chunk] Session not found or not pending:', sessionId);
      return NextResponse.json({ error: 'Sessione upload non trovata o scaduta' }, { status: 404 });
    }
    if (session.owner_id && session.owner_id !== user.id) {
      return NextResponse.json({ error: 'Sessione upload non valida per questo utente' }, { status: 403 });
    }

    console.log('[upload/chunk] Session found:', { status: session.status, expiresAt: session.expires_at });

    if (new Date(session.expires_at).getTime() < Date.now()) {
      await supabaseAdmin
        .from('drive_upload_sessions')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      return NextResponse.json({ error: 'Sessione upload scaduta. Riprova.' }, { status: 400 });
    }

    console.log('[upload/chunk] Decrypting upload URL...');
    let uploadUrl: string;
    try {
      uploadUrl = decryptSecret(session.upload_uri_encrypted);
      console.log('[upload/chunk] Upload URL decrypted successfully');
    } catch (decErr) {
      console.error('[upload/chunk] Failed to decrypt upload URL:', decErr);
      return NextResponse.json({ error: 'Errore critico: URL di upload non valido' }, { status: 500 });
    }

    const totalSize = Number(session.size_bytes);
    const chunkSize = chunk.size;
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, totalSize);
    const isLast = chunkIndex >= totalChunks - 1;

    const rangeHeader = `bytes ${start}-${isLast ? totalSize - 1 : end - 1}/${totalSize}`;
    console.log('[upload/chunk] Uploading to Google:', { range: rangeHeader, chunkSize });

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': session.mime_type,
        'Content-Length': String(chunkSize),
        'Content-Range': rangeHeader,
      },
      body: chunk.stream(),
      // @ts-ignore
      duplex: 'half',
    });

    console.log('[upload/chunk] Google response status:', uploadRes.status);

    if (uploadRes.status === 200 || uploadRes.status === 201) {
      const text = await uploadRes.text();
      console.log('[upload/chunk] Google upload complete, response:', text.slice(0, 500));
      let data: { id?: string } | null = null;
      try {
        data = JSON.parse(text);
      } catch {
        // empty body
      }
      return NextResponse.json({
        success: true,
        driveFileId: data?.id || null,
        isComplete: true,
      });
    }

    if (uploadRes.status === 308) {
      const range = uploadRes.headers.get('range');
      console.log('[upload/chunk] Partial upload, range:', range);
      return NextResponse.json({
        success: true,
        driveFileId: null,
        isComplete: false,
        range,
      });
    }

    const errorText = await uploadRes.text();
    console.error('[upload/chunk] Google upload FAILED:', {
      status: uploadRes.status,
      error: errorText.slice(0, 500),
    });
    return NextResponse.json(
      { error: `Upload fallito su Google (${uploadRes.status}): ${errorText.slice(0, 200)}` },
      { status: 500 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[upload/chunk] Unhandled error:', { message, stack: error instanceof Error ? error.stack : undefined });
    return NextResponse.json(
      { error: `Errore interno: ${message}` },
      { status: 500 }
    );
  }
}

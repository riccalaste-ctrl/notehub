import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { decryptSecret } from '@/lib/secure-tokens';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const sessionId = formData.get('sessionId') as string;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string, 10);
    const totalChunks = parseInt(formData.get('totalChunks') as string, 10);
    const chunk = formData.get('chunk') as File;

    if (!sessionId || isNaN(chunkIndex) || isNaN(totalChunks) || !chunk) {
      return NextResponse.json({ error: 'Dati chunk non validi' }, { status: 400 });
    }

    const { data: session } = await supabaseAdmin
      .from('drive_upload_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('status', 'pending')
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: 'Sessione upload non trovata o scaduta' }, { status: 404 });
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      await supabaseAdmin
        .from('drive_upload_sessions')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      return NextResponse.json({ error: 'Sessione upload scaduta. Riprova.' }, { status: 400 });
    }

    const uploadUrl = decryptSecret(session.upload_uri_encrypted);
    const totalSize = Number(session.size_bytes);
    const chunkSize = chunk.size;
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, totalSize);
    const isLast = chunkIndex >= totalChunks - 1;

    const rangeHeader = `bytes ${start}-${isLast ? totalSize - 1 : end - 1}/${totalSize}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': session.mime_type,
        'Content-Length': String(chunkSize),
        'Content-Range': rangeHeader,
      },
      body: chunk.stream(),
    });

    if (uploadRes.status === 200 || uploadRes.status === 201) {
      const data = await uploadRes.json();
      return NextResponse.json({
        success: true,
        driveFileId: data?.id || null,
        isComplete: true,
      });
    }

    if (uploadRes.status === 308) {
      const range = uploadRes.headers.get('range');
      return NextResponse.json({
        success: true,
        driveFileId: null,
        isComplete: false,
        range,
      });
    }

    const errorText = await uploadRes.text();
    console.error('[upload/chunk] Google upload failed:', uploadRes.status, errorText);
    return NextResponse.json(
      { error: `Upload fallito (${uploadRes.status})` },
      { status: 500 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Chunk upload error:', message);
    return NextResponse.json(
      { error: 'Errore durante il caricamento del chunk' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { getAuthorizedDriveForProfessor, verifyDriveFile } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(25).default(10),
});

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parametri di migrazione non validi.' }, { status: 400 });
  }

  const { offset, limit } = parsed.data;
  const { data: uploads, error } = await supabaseAdmin
    .from('uploads')
    .select('id, drive_file_id, drive_folder_id, professor_id, size_bytes')
    .not('drive_file_id', 'is', null)
    .not('professor_id', 'is', null)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[drive-privacy-migration] Database query failed:', error);
    return NextResponse.json({ error: 'Impossibile leggere i file da migrare.' }, { status: 500 });
  }

  const authorizedByProfessor = new Map<string, Awaited<ReturnType<typeof getAuthorizedDriveForProfessor>>>();
  const failures: Array<{ uploadId: string; reason: string }> = [];
  let secured = 0;

  for (const upload of uploads || []) {
    try {
      if (!upload.drive_file_id || !upload.drive_folder_id || !upload.professor_id) {
        throw new Error('Metadati del file incompleti');
      }

      let authorized = authorizedByProfessor.get(upload.professor_id);
      if (!authorized) {
        authorized = await getAuthorizedDriveForProfessor(upload.professor_id);
        authorizedByProfessor.set(upload.professor_id, authorized);
      }

      await verifyDriveFile(
        authorized.auth,
        upload.drive_file_id,
        upload.drive_folder_id,
        Number(upload.size_bytes)
      );
      secured += 1;
    } catch (error) {
      failures.push({
        uploadId: upload.id,
        reason: error instanceof Error ? error.message.slice(0, 180) : 'Errore non identificato',
      });
    }
  }

  const processed = uploads?.length || 0;
  return NextResponse.json({
    processed,
    secured,
    failed: failures.length,
    failures,
    nextOffset: offset + processed,
    complete: processed < limit,
    note: 'Ripeti la chiamata con nextOffset finché complete è true per migrare tutti i file.',
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedUserFromRequest } from '@/lib/user-session';
import { deleteFileFromDrive } from '@/lib/google-drive';

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { data: upload, error: fetchError } = await supabaseAdmin
    .from('uploads')
    .select('id, owner_id, drive_file_id, professor_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: 'Failed to load upload' }, { status: 500 });
  }
  if (!upload) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  if (upload.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (upload.drive_file_id && upload.professor_id) {
    try {
      await deleteFileFromDrive(upload.professor_id, upload.drive_file_id);
    } catch {
      // Keep DB consistency even if Drive deletion fails.
    }
  }

  const { error } = await supabaseAdmin.from('uploads').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete upload' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

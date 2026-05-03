import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { deleteFileFromDrive } from '@/lib/google-drive';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let query = supabaseAdmin
      .from('uploads')
      .select(`
        *,
        subject:subjects(name, slug),
        professor:professors(name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('original_filename', `%${search}%`);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo + 'T23:59:59');
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ uploads: data || [] });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing upload ID' },
        { status: 400 }
      );
    }

    const { data: upload, error: fetchError } = await supabaseAdmin
      .from('uploads')
      .select('drive_file_id, professor_id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (upload?.drive_file_id && upload?.professor_id) {
      try {
        await deleteFileFromDrive(upload.professor_id, upload.drive_file_id);
      } catch (driveError) {
        console.warn('Drive deletion failed, proceeding with DB removal:', driveError);
      }
    }

    const { error } = await supabaseAdmin
      .from('uploads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await logAuditEvent({
      actor_email: 'admin@notehub.local',
      action: 'upload_deleted_global',
      target_type: 'uploads',
      target_id: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting upload:', error);
    return NextResponse.json(
      { error: 'Failed to delete upload' },
      { status: 500 }
    );
  }
}

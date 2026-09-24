import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedUserFromRequest } from '@/lib/user-session';
import { isPreviewMode, previewUploads } from '@/lib/preview-data';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const professorId = searchParams.get('professor_id');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const requestedLimit = Number(searchParams.get('limit') || '50');
    const requestedOffset = Number(searchParams.get('offset') || '0');
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
    const offset = Number.isInteger(requestedOffset) ? Math.min(Math.max(requestedOffset, 0), 10000) : 0;
    if (search && search.length > 120) {
      return NextResponse.json({ error: 'Parametro di ricerca troppo lungo' }, { status: 400 });
    }

    if (isPreviewMode) {
      const filtered = previewUploads.filter((upload) => {
        const matchesSubject = !subjectId || upload.subject_id === subjectId;
        const matchesProfessor = !professorId || upload.professor_id === professorId;
        const matchesSearch = !search ||
          upload.original_filename.toLowerCase().includes(search.toLowerCase());
        return matchesSubject && matchesProfessor && matchesSearch;
      });
      return NextResponse.json({
        uploads: filtered.slice(offset, offset + limit),
        offset,
        limit,
      });
    }

    let query = supabaseAdmin
      .from('uploads')
      .select(`
        id, subject_id, professor_id, original_filename, download_url, view_url,
        mime_type, size_bytes, created_at,
        subject:subjects(name, slug),
        professor:professors(name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    if (professorId) {
      query = query.eq('professor_id', professorId);
    }

    if (search) {
      query = query.ilike('original_filename', `%${search}%`);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo + 'T23:59:59');
    }

    const { data: uploads, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch uploads' },
        { status: 500 }
      );
    }

    const uploadsWithDetails = uploads?.map((upload) => {
      return {
        ...upload,
        subject_name: upload.subject?.[0]?.name,
        subject_slug: upload.subject?.[0]?.slug,
        professor_name: upload.professor?.[0]?.name,
      };
    }) || [];

    return NextResponse.json({
      uploads: uploadsWithDetails,
      offset,
      limit,
    });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

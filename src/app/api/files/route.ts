import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const professorId = searchParams.get('professor_id');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('uploads')
      .select(`
        *,
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

    const uploadsWithDetails = uploads?.map((upload) => ({
      ...upload,
      subject_name: upload.subject?.name,
      subject_slug: upload.subject?.slug,
      professor_name: upload.professor?.name,
    })) || [];

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
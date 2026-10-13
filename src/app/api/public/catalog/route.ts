import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isPreviewMode, previewProfessors, previewSubjectProfessors, previewSubjects, previewUploads } from '@/lib/preview-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isPreviewMode) {
    const subjects = previewSubjects.map((subject) => ({
      ...subject,
      upload_count: previewUploads.filter((upload) => upload.subject_id === subject.id).length,
    }));
    return NextResponse.json({
      subjects,
      professors: previewProfessors,
      subjectProfessors: previewSubjectProfessors,
    });
  }

  try {
    const [subjectsResult, professorsResult, associationsResult] = await Promise.all([
      supabaseAdmin
        .from('subjects')
        .select('id, name, slug, enabled')
        .eq('enabled', true)
        .order('name'),
      supabaseAdmin
        .from('professors')
        .select('id, name')
        .order('name'),
      supabaseAdmin
        .from('subject_professors')
        .select(`
          id,
          subject_id,
          professor_id,
          professor:professors(id, name)
        `),
    ]);

    if (subjectsResult.error) throw subjectsResult.error;
    if (professorsResult.error) throw professorsResult.error;
    if (associationsResult.error) throw associationsResult.error;

    const subjectsWithCounts = await Promise.all(
      (subjectsResult.data || []).map(async (subject) => {
        const { count, error } = await supabaseAdmin
          .from('uploads')
          .select('id', { count: 'exact', head: true })
          .eq('subject_id', subject.id);

        if (error) throw error;
        return { ...subject, upload_count: count ?? 0 };
      })
    );

    const subjectProfessors = (associationsResult.data || []).map((association: any) => ({
      ...association,
      professor: Array.isArray(association.professor)
        ? association.professor[0]
        : association.professor,
    }));

    return NextResponse.json({
      subjects: subjectsWithCounts,
      professors: professorsResult.data || [],
      subjectProfessors,
    });
  } catch (error) {
    console.error('Public catalog error:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}

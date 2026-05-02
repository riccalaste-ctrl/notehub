import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    const subjectProfessors = (associationsResult.data || []).map((association: any) => ({
      ...association,
      professor: Array.isArray(association.professor)
        ? association.professor[0]
        : association.professor,
    }));

    return NextResponse.json({
      subjects: subjectsResult.data || [],
      professors: professorsResult.data || [],
      subjectProfessors,
    });
  } catch (error) {
    console.error('Public catalog error:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}

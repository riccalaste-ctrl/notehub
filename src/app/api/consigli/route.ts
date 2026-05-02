import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('consigli')
      .select(`
        *,
        professor:professors(id, name)
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      consigli: (data || []).map((c: any) => ({
        ...c,
        professor: Array.isArray(c.professor) ? c.professor[0] : c.professor,
      })),
    });
  } catch (error) {
    console.error('Consigli fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch consigli' }, { status: 500 });
  }
}

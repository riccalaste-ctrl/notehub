import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { data, error } = await supabaseAdmin
      .from('consigli')
      .select(`
        *,
        professor:professors(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      consigli: (data || []).map((c: any) => ({
        ...c,
        professor: Array.isArray(c.professor) ? c.professor[0] : c.professor,
      })),
    });
  } catch (error) {
    console.error('Admin consigli fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch consigli' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, content, professor_id, published } = body;

    if (!title?.trim() || !content?.trim() || !professor_id) {
      return NextResponse.json(
        { error: 'Titolo, contenuto e professore sono obbligatori' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('consigli')
      .insert({
        title: title.trim(),
        content: content.trim(),
        professor_id,
        published: published !== undefined ? published : true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ consiglio: data }, { status: 201 });
  } catch (error) {
    console.error('Create consiglio error:', error);
    return NextResponse.json({ error: 'Failed to create consiglio' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, title, content, professor_id, published } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();
    if (professor_id !== undefined) updates.professor_id = professor_id;
    if (published !== undefined) updates.published = published;

    const { data, error } = await supabaseAdmin
      .from('consigli')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ consiglio: data });
  } catch (error) {
    console.error('Update consiglio error:', error);
    return NextResponse.json({ error: 'Failed to update consiglio' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('consigli')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete consiglio error:', error);
    return NextResponse.json({ error: 'Failed to delete consiglio' }, { status: 500 });
  }
}

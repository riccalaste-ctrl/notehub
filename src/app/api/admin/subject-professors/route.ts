import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const associationSchema = z.object({
  subject_id: z.string().uuid(),
  professor_id: z.string().uuid(),
});

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('subject_professors')
      .select(`
        *,
        subject:subjects(id, name, slug),
        professor:professors(id, name)
      `);

    if (error) throw error;

    return NextResponse.json({ associations: data || [] });
  } catch (error) {
    console.error('Error fetching associations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch associations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const validation = associationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('subject_professors')
      .insert(validation.data)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Association already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ association: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating association:', error);
    return NextResponse.json(
      { error: 'Failed to create association' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing association ID' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('subject_professors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting association:', error);
    return NextResponse.json(
      { error: 'Failed to delete association' },
      { status: 500 }
    );
  }
}

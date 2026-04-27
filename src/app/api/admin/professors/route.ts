import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const professorSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { data, error } = await supabaseAdmin
      .from('professors')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json({ professors: data || [] });
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const validation = professorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('professors')
      .insert({ name: validation.data.name })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ professor: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating professor:', error);
    return NextResponse.json(
      { error: 'Failed to create professor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('professors')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ professor: data });
  } catch (error) {
    console.error('Error updating professor:', error);
    return NextResponse.json(
      { error: 'Failed to update professor' },
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
        { error: 'Missing professor ID' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('professors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting professor:', error);
    return NextResponse.json(
      { error: 'Failed to delete professor' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const professorSchema = z.object({
  name: z.string().min(1).max(100),
});

function sanitizeProfessor(professor: any) {
  const connection = Array.isArray(professor.drive_connection)
    ? professor.drive_connection[0]
    : professor.drive_connection;

  return {
    id: professor.id,
    name: professor.name,
    created_at: professor.created_at,
    drive_connection: connection
      ? {
          id: connection.id,
          google_email: connection.google_email,
          status: connection.status,
          root_folder_id: connection.root_folder_id,
          connected_at: connection.connected_at,
          disconnected_at: connection.disconnected_at,
          last_error: connection.last_error,
        }
      : null,
  };
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { data, error } = await supabaseAdmin!
      .from('professors')
      .select(`
        id,
        name,
        created_at,
        drive_connection:professor_drive_connections(
          id,
          google_email,
          status,
          root_folder_id,
          connected_at,
          disconnected_at,
          last_error
        )
      `)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ professors: (data || []).map(sanitizeProfessor) });
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
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
      .insert({
        name: validation.data.name,
      })
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
  const authError = await requireAdmin();
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
      .update({
        name,
      })
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
  const authError = await requireAdmin();
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

    const { error } = await supabaseAdmin!
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

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminAuthenticated, requireAuth } from '@/lib/auth';
import { z } from 'zod';

const subjectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  gas_url: z.string().url().optional().or(z.literal('')),
  gas_secret: z.string().max(100).optional().or(z.literal('')),
  enabled: z.boolean().default(true),
});

export async function GET() {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const { data, error } = await supabaseAdmin
      .from('subjects')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json({ subjects: data || [] });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const validation = subjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, slug, gas_url, gas_secret, enabled } = validation.data;

    const { data, error } = await supabaseAdmin
      .from('subjects')
      .insert({
        name,
        slug,
        gas_url: gas_url || null,
        gas_secret: gas_secret || null,
        enabled,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ subject: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const validation = subjectSchema.partial().safeParse(updates);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('subjects')
      .update({
        name: validation.data.name,
        slug: validation.data.slug,
        gas_url: validation.data.gas_url || null,
        gas_secret: validation.data.gas_secret || null,
        enabled: validation.data.enabled,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ subject: data });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing subject ID' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    );
  }
}
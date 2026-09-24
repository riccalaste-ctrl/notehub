import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedUserFromRequest } from '@/lib/user-session';
import { isPreviewMode, previewUploads } from '@/lib/preview-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedLimit = Number(searchParams.get('limit') || '50');
  const requestedOffset = Number(searchParams.get('offset') || '0');
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
  const offset = Number.isInteger(requestedOffset) ? Math.min(Math.max(requestedOffset, 0), 10000) : 0;

  if (isPreviewMode) {
    return NextResponse.json({ uploads: previewUploads.slice(offset, offset + limit), offset, limit });
  }

  const { data, error } = await supabaseAdmin
    .from('uploads')
    .select(`
      *,
      subject:subjects(name, slug),
      professor:professors(name)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch user uploads' }, { status: 500 });
  }

  return NextResponse.json({
    uploads: data || [],
    offset,
    limit,
  });
}

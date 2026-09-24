import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isPreviewMode, previewConsigliFiles } from '@/lib/preview-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isPreviewMode) {
    return NextResponse.json({ files: previewConsigliFiles });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('consigli_files')
      .select('id, consiglio_id, original_filename, mime_type, size_bytes, download_url, view_url, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ files: data || [] });
  } catch (error) {
    console.error('Public consigli files fetch error:', error);
    return NextResponse.json({ files: [] });
  }
}

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['admin_email', 'support_email', 'site_policy', 'consigli_email']);

    if (error) throw error;

    const settings = (data || []).reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {});

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json(
      { settings: { admin_email: '', support_email: '', site_policy: '', consigli_email: '' } }
    );
  }
}

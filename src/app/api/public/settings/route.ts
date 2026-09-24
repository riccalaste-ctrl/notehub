import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { isPreviewMode, previewSettings } from '@/lib/preview-data';

export async function GET() {
  if (isPreviewMode) {
    return NextResponse.json({ settings: previewSettings });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'admin_email',
        'support_email',
        'site_policy',
        'consigli_email',
        'legal_project_name',
        'legal_controller_name',
        'legal_controller_email',
        'legal_controller_address',
        'legal_dpo_email',
        'legal_hosting_provider',
        'legal_data_retention',
        'legal_minimum_age',
        'legal_policy_updated_at',
      ]);

    if (error) throw error;

    const settings = (data || []).reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {});

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json(
      {
        settings: {
          admin_email: '',
          support_email: '',
          site_policy: '',
          consigli_email: '',
          legal_project_name: 'NoteHub',
          legal_controller_name: '',
          legal_controller_email: '',
          legal_controller_address: '',
          legal_dpo_email: '',
          legal_hosting_provider: '',
          legal_data_retention: '',
          legal_minimum_age: '14',
          legal_policy_updated_at: '',
        },
      }
    );
  }
}

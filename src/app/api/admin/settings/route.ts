import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { z } from 'zod';
import { DEVELOPER_EMAILS } from '@/lib/user-session';

const allowedSettingKeys = [
  'support_email',
  'admin_email',
  'site_policy',
  'allowed_external_emails',
  'consigli_email',
] as const;

const settingSchema = z.object({
  key: z.enum(allowedSettingKeys),
  value: z.string().max(5000),
});

function normalizeSettingValue(key: typeof allowedSettingKeys[number], value: string) {
  if (key === 'support_email' || key === 'admin_email' || key === 'consigli_email') {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return '';

    if (!z.string().email().safeParse(trimmed).success) {
      throw new Error('Email non valida');
    }

    return trimmed;
  }

  if (key === 'allowed_external_emails') {
    const emails = value
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const devEmailAttempt = emails.find((item) => DEVELOPER_EMAILS.includes(item));
    if (devEmailAttempt) {
      throw new Error(`L'email ${devEmailAttempt} ha accesso permanente come sviluppatore e non può essere aggiunta alla whitelist temporanea`);
    }

    const invalidEmail = emails.find((item) => !z.string().email().safeParse(item).success);
    if (invalidEmail) {
      throw new Error(`Email non valida nella whitelist: ${invalidEmail}`);
    }

    return Array.from(new Set(emails)).join(',');
  }

  return value.trim();
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('key, value, description');

    if (error) throw error;

    const settings = (data || []).reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {});

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const validation = settingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Impostazione non valida', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { key } = validation.data;
    let value: string;
    try {
      value = normalizeSettingValue(key, validation.data.value);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Valore impostazione non valido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      actor_email: 'admin@notehub.local',
      action: 'setting_updated',
      target_type: 'site_settings',
      target_id: key,
      metadata: { key },
    });

    return NextResponse.json({ setting: data });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

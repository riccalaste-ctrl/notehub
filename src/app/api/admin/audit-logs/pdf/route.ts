import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { createSimplePdf } from '@/lib/audit';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json({ error: 'Failed to export audit logs' }, { status: 500 });
  }

  const rows = data || [];
  const lines = [
    'NoteHub Audit Logs',
    `Generated: ${new Date().toISOString()}`,
    '---------------------------------------',
    ...rows.map((row) => {
      const who = row.actor_email || 'system';
      const target = row.target_type ? `${row.target_type}:${row.target_id || '-'}` : '-';
      return `${row.created_at} | ${who} | ${row.action} | ${target}`;
    }),
  ];

  const pdfBuffer = createSimplePdf(lines);
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="audit-logs-${Date.now()}.pdf"`,
    },
  });
}

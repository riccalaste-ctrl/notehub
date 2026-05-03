import { supabaseAdmin } from '@/lib/supabase';

interface AuditPayload {
  actor_email?: string | null;
  action: string;
  target_type: string;
  target_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function logAuditEvent(payload: AuditPayload) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      actor_email: payload.actor_email || null,
      action: payload.action,
      target_type: payload.target_type,
      target_id: payload.target_id || null,
      metadata: payload.metadata || {},
    });
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function createSimplePdf(lines: string[]) {
  const contentLines = lines.map((line, idx) => `BT /F1 10 Tf 40 ${800 - idx * 14} Td (${escapePdfText(line)}) Tj ET`);
  const stream = contentLines.join('\n');
  const streamLength = stream.length;

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${streamLength} >> stream\n${stream}\nendstream endobj`,
  ];

  let offset = 9;
  const xref = ['xref', `0 ${objects.length + 1}`, '0000000000 65535 f '];
  const body = objects
    .map((obj) => {
      const currentOffset = String(offset).padStart(10, '0');
      xref.push(`${currentOffset} 00000 n `);
      offset += obj.length + 1;
      return obj;
    })
    .join('\n');

  const xrefOffset = 9 + body.length + 1;
  const pdf = `%PDF-1.4\n${body}\n${xref.join('\n')}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

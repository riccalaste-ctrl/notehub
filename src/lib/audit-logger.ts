/**
 * Audit Logger - Registra tutte le azioni importanti in Supabase
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface AuditLogEntry {
  actor_email?: string;
  action: string;
  target_type: string;
  target_id?: string;
  metadata?: Record<string, any>;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[audit] Supabase env vars missing, skipping audit log');
      return;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    });

    await supabase.from('audit_logs').insert({
      actor_email: entry.actor_email || 'unknown',
      action: entry.action,
      target_type: entry.target_type,
      target_id: entry.target_id,
      metadata: entry.metadata || {},
    });
  } catch (err) {
    console.error('[audit] Failed to log event:', err);
    // Non lanciare errore, è solo logging
  }
}

export async function logAdminLogin(email: string, success: boolean, reason?: string): Promise<void> {
  return logAuditEvent({
    actor_email: email,
    action: success ? 'ADMIN_LOGIN_SUCCESS' : 'ADMIN_LOGIN_FAILED',
    target_type: 'admin_session',
    metadata: {
      reason: reason || null,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function logFileUpload(userEmail: string, fileId: string, fileName: string, sizeBytes: number): Promise<void> {
  return logAuditEvent({
    actor_email: userEmail,
    action: 'FILE_UPLOAD',
    target_type: 'drive_file',
    target_id: fileId,
    metadata: {
      fileName,
      sizeBytes,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function logFileDownload(userEmail: string, fileId: string, fileName: string): Promise<void> {
  return logAuditEvent({
    actor_email: userEmail,
    action: 'FILE_DOWNLOAD',
    target_type: 'drive_file',
    target_id: fileId,
    metadata: {
      fileName,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, any>
): Promise<void> {
  return logAuditEvent({
    actor_email: adminEmail,
    action: `ADMIN_${action}`,
    target_type: targetType,
    target_id: targetId,
    metadata: {
      ...details,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function logSecurityEvent(
  eventType: string,
  details?: Record<string, any>,
  userEmail?: string
): Promise<void> {
  return logAuditEvent({
    actor_email: userEmail,
    action: `SECURITY_${eventType}`,
    target_type: 'security',
    metadata: {
      ...details,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Audit logging for security-sensitive operations.
 * In production: write to file, database, or external logging service.
 */

type AuditAction = 'login' | 'login_failed' | 'logout' | 'create_user' | 'delete_user' |
  'create_student' | 'update_student' | 'delete_student' |
  'create_assessment' | 'create_transaction' | 'update_settings' |
  'export_data' | 'import_data' | 'upload_file' | 'wablas_send';

interface AuditEntry {
  timestamp: string;
  action: AuditAction;
  userId: number;
  tenantId: number | null;
  details: string;
  ip?: string;
}

export function auditLog(entry: Omit<AuditEntry, 'timestamp'>): void {
  const log: AuditEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // In production: persist to database or external logging service
  // For now: structured console log that can be captured
  console.log(`[AUDIT] ${log.timestamp} | user=${log.userId} | tenant=${log.tenantId} | ${log.action} | ${log.details}`);

  // TODO: await query('INSERT INTO audit_logs ...', [log])
}

/**
 * Log security events in background (fire-and-forget).
 */
export function auditLogAsync(entry: Omit<AuditEntry, 'timestamp'>): void {
  // Don't await — audit logging should never block the response
  setImmediate(() => auditLog(entry));
}

export type AuditChipColor = 'success' | 'error' | 'info' | 'warning' | 'default';

/** Maps an audit action verb to a semantic chip color. */
export function auditActionColor(action: string): AuditChipColor {
    const a = action.toUpperCase();
    if (/(DELETE|REVOKE|REMOVE|DENY|PURGE|FAIL)/.test(a)) return 'error';
    if (/(CREATE|ADD|GRANT|APPROVE|PASS)/.test(a)) return 'success';
    if (/(UPDATE|PATCH|EDIT|CHANGE|DECISION|REASSIGN)/.test(a)) return 'info';
    if (/IMPERSONAT/.test(a)) return 'warning';
    return 'default';
}

import { AuditLog } from '@/types';
import { store } from '@/lib/store';

export function getAuditLogs(): AuditLog[] {
  return store.getAuditLogs();
}

import { AuditLog } from '@/types';
import { store } from '@/lib/store';
import { getCurrentUser } from './auth-service';

export function getAuditLogs(): AuditLog[] {
  return store.getAuditLogs();
}

export function deleteAuditLog(logId: string): void {
  const currentUser = getCurrentUser();
  if (currentUser?.role !== 'manager') {
    throw new Error('عفواً، هذه الصلاحية خاصة بحساب المديرة فقط');
  }

  const logs = store.getAuditLogs();
  store.saveAuditLogs(logs.filter(l => l.id !== logId));
}

export function clearAuditLogs(): void {
  const currentUser = getCurrentUser();
  if (currentUser?.role !== 'manager') {
    throw new Error('عفواً، هذه الصلاحية خاصة بحساب المديرة فقط');
  }

  store.saveAuditLogs([]);
}

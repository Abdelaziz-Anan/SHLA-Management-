import { CenterInfo } from '@/types';
import { store } from '@/lib/store';
import { getCurrentUser } from './auth-service';

export function getCenterBranding(): CenterInfo {
  return store.getCenter();
}

export function updateCenterBranding(updates: Partial<CenterInfo>): CenterInfo {
  const currentUser = getCurrentUser();
  const current = store.getCenter();
  const updated: CenterInfo = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  store.saveCenter(updated);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `تحديث بيانات وهوية السنتر (${updated.name})`,
    entity_type: 'Branding',
    entity_id: updated.id,
    old_data: current,
    new_data: updated,
  });

  return updated;
}

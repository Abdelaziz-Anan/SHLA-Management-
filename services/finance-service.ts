import { FinanceSummary, Settlement } from '@/types';
import { store } from '@/lib/store';
import { getCurrentUser } from './auth-service';

export function getFinanceSummary(filterMonth?: string): FinanceSummary {
  const validPayments = store.getPayments().filter(p => p.status === 'valid');
  const accounts = store.getAccounts();
  const allSettlements = store.getSettlements();
  const groupStudents = store.getGroupStudents().filter(gs => gs.status === 'active');
  const groups = store.getGroups();
  const students = store.getStudents();

  // Filter payments by month if provided (e.g., "2025-10" or "2026-08")
  let payments = validPayments;
  let settlements = allSettlements;
  if (filterMonth) {
    payments = validPayments.filter(p => p.payment_date.startsWith(filterMonth));
    settlements = allSettlements.filter(s => s.settlement_date.startsWith(filterMonth));
  }

  const accountMap = new Map(accounts.map(a => [a.id, a]));

  let totalCollected = 0;
  let managerReceived = 0;
  let centerReceived = 0;

  for (let i = 0; i < payments.length; i++) {
    const p = payments[i];
    const acc = p.receiving_account_id ? accountMap.get(p.receiving_account_id) : undefined;
    totalCollected += p.amount;

    if (acc?.owner_type === 'manager') {
      managerReceived += p.amount;
    } else {
      centerReceived += p.amount;
    }
  }

  // Calculate total settled to manager
  let totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);
  let remainingWithCenter = Math.max(0, centerReceived - totalSettled);

  // Pre-aggregate payments sum per group_student_id in O(P)
  const paidMap = new Map<string, number>();
  for (let i = 0; i < validPayments.length; i++) {
    const p = validPayments[i];
    paidMap.set(p.group_student_id, (paidMap.get(p.group_student_id) || 0) + p.amount);
  }

  // Calculate outstanding in single O(GS) pass
  let totalOutstanding = 0;
  for (let i = 0; i < groupStudents.length; i++) {
    const gs = groupStudents[i];
    const paid = paidMap.get(gs.id) || 0;
    totalOutstanding += Math.max(0, gs.course_price - paid);
  }

  return {
    total_collected: totalCollected,
    received_by_manager: managerReceived,
    received_by_center: centerReceived,
    total_settled_to_manager: totalSettled,
    remaining_with_center: remainingWithCenter,
    total_outstanding_students: totalOutstanding,
    payment_count: payments.length,
    student_count: students.length,
    group_count: groups.length,
  };
}

export function getSettlementHistory(): Settlement[] {
  return store.getSettlements().sort((a, b) => b.settlement_date.localeCompare(a.settlement_date));
}

export function recordSettlement(data: {
  amount: number;
  settlement_date?: string;
  delivered_by?: string;
  delivered_by_name?: string;
  proof_url?: string;
  notes?: string;
}): Settlement {
  const currentUser = getCurrentUser();
  const center = store.getCenter();
  const settlements = store.getSettlements();

  if (data.amount <= 0) {
    throw new Error('مبلغ التسليم يجب أن يكون أكبر من صفر');
  }

  const newSettlement: Settlement = {
    id: `stl-${Date.now()}`,
    center_id: center.id,
    amount: Number(data.amount),
    settlement_date: data.settlement_date || new Date().toISOString().split('T')[0],
    delivered_by: data.delivered_by || currentUser?.id || 'usr-assistant-1',
    delivered_by_name: data.delivered_by_name || currentUser?.full_name || 'المساعد',
    received_by: 'usr-manager-1',
    received_by_name: 'د. سمر حمدي (Manager)',
    proof_url: data.proof_url,
    notes: data.notes,
    created_at: new Date().toISOString(),
  };

  store.saveSettlements([newSettlement, ...settlements]);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `تسليم نقدية للمدير بقيمة ${newSettlement.amount} EGP`,
    entity_type: 'Settlement',
    entity_id: newSettlement.id,
    new_data: newSettlement,
  });

  return newSettlement;
}

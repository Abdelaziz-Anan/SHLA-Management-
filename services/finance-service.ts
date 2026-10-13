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
    const isCenterAccount =
      acc?.owner_type === 'center' ||
      p.receiving_account_id === 'acc-center-cash' ||
      p.receiving_account_id === 'acc-center-instapay' ||
      p.receiving_account_id === 'acc-center-wallet' ||
      Boolean(p.receiving_account_id && (p.receiving_account_id.includes('center') || p.receiving_account_id.includes('academy'))) ||
      Boolean(p.custom_receiving_account && (
        p.custom_receiving_account.includes('خزينة') ||
        p.custom_receiving_account.includes('الأكاديمية') ||
        p.custom_receiving_account.includes('Center')
      ));

    const isManagerAccount =
      !isCenterAccount && (
        acc?.owner_type === 'manager' ||
        p.receiving_account_id === 'acc-mgr-wallet' ||
        p.receiving_account_id === 'acc-mgr-instapay' ||
        p.receiving_account_id === 'acc-mgr-cash' ||
        Boolean(p.receiving_account_id && (p.receiving_account_id.includes('mgr') || p.receiving_account_id.includes('manager'))) ||
        Boolean(p.custom_receiving_account && (
          p.custom_receiving_account.includes('01066383920') ||
          p.custom_receiving_account.includes('المديرة') ||
          p.custom_receiving_account.includes('المدير')
        ))
      );

    if (isManagerAccount) {
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

  // Active enrolled students count (students who are actually in active groups)
  const activeEnrolledStudentIds = new Set(groupStudents.map(gs => gs.student_id));
  const activeStudentCount = activeEnrolledStudentIds.size;

  return {
    total_collected: totalCollected,
    received_by_manager: managerReceived,
    received_by_center: centerReceived,
    total_settled_to_manager: totalSettled,
    remaining_with_center: remainingWithCenter,
    total_outstanding_students: totalOutstanding,
    payment_count: payments.length,
    student_count: activeStudentCount,
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
    delivered_by_name: data.delivered_by_name || currentUser?.full_name || 'Admin',
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

export function deleteSettlement(settlementId: string): void {
  const currentUser = getCurrentUser();
  if (currentUser?.role !== 'manager') {
    throw new Error('عفواً، هذه الصلاحية خاصة بحساب المديرة فقط');
  }

  const settlements = store.getSettlements();
  const settlement = settlements.find(s => s.id === settlementId);
  if (!settlement) throw new Error('المعاملة غير موجودة');

  store.saveSettlements(settlements.filter(s => s.id !== settlementId));

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `حذف معاملة تسليم مالي بقيمة ${settlement.amount} EGP بواسطة المديرة`,
    entity_type: 'SettlementDelete',
    entity_id: settlementId,
    old_data: settlement,
  });
}

export function deleteAllSettlements(): void {
  const currentUser = getCurrentUser();
  if (currentUser?.role !== 'manager') {
    throw new Error('عفواً، هذه الصلاحية خاصة بحساب المديرة فقط');
  }

  const count = store.getSettlements().length;
  store.saveSettlements([]);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `حذف كافة سجلات تسليم النقدية (${count} معاملة) في الإدارة المالية بواسطة المديرة`,
    entity_type: 'SettlementReset',
  });
}

export function deleteAllFinancialTransactions(): void {
  const currentUser = getCurrentUser();
  if (currentUser?.role !== 'manager') {
    throw new Error('عفواً، هذه الصلاحية خاصة بحساب المديرة فقط');
  }

  const settlementsCount = store.getSettlements().length;
  const paymentsCount = store.getPayments().length;
  store.saveSettlements([]);
  store.savePayments([]);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `حذف وتصفير كافة المعاملات المالية بالكامل (${settlementsCount} تسليمات، ${paymentsCount} مدفوعات) بواسطة المديرة`,
    entity_type: 'FinanceReset',
  });
}

import { Payment, PaymentMethod } from '@/types';
import { store } from '@/lib/store';
import { getCurrentUser } from './auth-service';

export function getPaymentsByGroupStudent(groupStudentId: string): Payment[] {
  const payments = store.getPayments();
  const accounts = store.getAccounts();
  const accountMap = new Map(accounts.map(a => [a.id, a]));

  return payments
    .filter(p => p.group_student_id === groupStudentId)
    .map(p => ({
      ...p,
      receiving_account: p.receiving_account_id ? accountMap.get(p.receiving_account_id) : undefined,
    }))
    .sort((a, b) => b.payment_date.localeCompare(a.payment_date));
}

export function recordPayment(data: {
  group_student_id: string;
  amount: number;
  payment_date?: string;
  payment_method: PaymentMethod;
  receiving_account_id: string;
  custom_receiving_account?: string;
  receipt_url?: string;
  notes?: string;
}): Payment {
  const currentUser = getCurrentUser();
  const payments = store.getPayments();
  const accounts = store.getAccounts();

  const account = accounts.find(a => a.id === data.receiving_account_id);
  if (!account) throw new Error('جهة استلام النقدية (Payment Destination) غير محددة أو غير صحيحة');

  if (data.amount <= 0) {
    throw new Error('المبلغ المدفوع يجب أن يكون أكبر من صفر');
  }

  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    group_student_id: data.group_student_id,
    amount: Number(data.amount),
    payment_date: data.payment_date || new Date().toISOString().split('T')[0],
    payment_method: data.payment_method,
    receiving_account_id: data.receiving_account_id,
    receiving_account: account,
    custom_receiving_account: data.custom_receiving_account?.trim(),
    receipt_url: data.receipt_url,
    created_by: currentUser?.id,
    created_by_name: currentUser?.full_name,
    status: 'valid',
    notes: data.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.savePayments([newPayment, ...payments]);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `تسجيل دفعة مالية بقيمة ${newPayment.amount} EGP (${newPayment.payment_method} - ${account.account_name})`,
    entity_type: 'Payment',
    entity_id: newPayment.id,
    new_data: newPayment,
  });

  return newPayment;
}

export function updatePaymentDetails(
  paymentId: string,
  updates: {
    amount?: number;
    payment_date?: string;
    payment_method?: PaymentMethod;
    receiving_account_id?: string;
    custom_receiving_account?: string;
    receipt_url?: string;
    status?: 'valid' | 'reversed';
    reversal_reason?: string;
  }
): Payment {
  const currentUser = getCurrentUser();
  const payments = store.getPayments();
  const index = payments.findIndex(p => p.id === paymentId);

  if (index === -1) throw new Error('العملية المالية غير موجودة');

  const oldPayment = payments[index];
  const updatedPayment: Payment = {
    ...oldPayment,
    amount: updates.amount !== undefined ? updates.amount : oldPayment.amount,
    payment_date: updates.payment_date || oldPayment.payment_date,
    payment_method: updates.payment_method || oldPayment.payment_method,
    receiving_account_id: updates.receiving_account_id || oldPayment.receiving_account_id,
    custom_receiving_account:
      updates.custom_receiving_account !== undefined
        ? updates.custom_receiving_account.trim()
        : oldPayment.custom_receiving_account,
    receipt_url: updates.receipt_url !== undefined ? updates.receipt_url : oldPayment.receipt_url,
    status: updates.status || oldPayment.status,
    reversal_reason:
      updates.reversal_reason !== undefined ? updates.reversal_reason : oldPayment.reversal_reason,
    updated_at: new Date().toISOString(),
  };

  payments[index] = updatedPayment;
  store.savePayments(payments);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `تعديل بيانات الدفعة المالية بقيمة ${updatedPayment.amount} EGP`,
    entity_type: 'PaymentEdit',
    entity_id: paymentId,
    old_data: oldPayment,
    new_data: updatedPayment,
  });

  return updatedPayment;
}

export function reversePayment(paymentId: string, reason: string): Payment {
  const currentUser = getCurrentUser();
  const payments = store.getPayments();
  const index = payments.findIndex(p => p.id === paymentId);

  if (index === -1) throw new Error('العملية المالية غير موجودة');

  const oldPayment = payments[index];
  if (oldPayment.status === 'reversed') {
    throw new Error('هذه العملية ملغاة بالفعل');
  }

  const reversedPayment: Payment = {
    ...oldPayment,
    status: 'reversed',
    reversal_reason: reason.trim(),
    updated_at: new Date().toISOString(),
  };

  payments[index] = reversedPayment;
  store.savePayments(payments);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `إلغاء وتصحيح عملية مالية (Reversal) بقيمة ${oldPayment.amount} EGP (السبب: ${reason})`,
    entity_type: 'PaymentReversal',
    entity_id: paymentId,
    old_data: oldPayment,
    new_data: reversedPayment,
  });

  return reversedPayment;
}

export function updatePaymentReceipt(paymentId: string, receiptUrl: string): Payment {
  const currentUser = getCurrentUser();
  const payments = store.getPayments();
  const index = payments.findIndex(p => p.id === paymentId);

  if (index === -1) throw new Error('العملية المالية غير موجودة');

  const payment = payments[index];
  payment.receipt_url = receiptUrl;
  payment.updated_at = new Date().toISOString();

  payments[index] = payment;
  store.savePayments(payments);

  store.addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: `رفع/تعديل إيصال العملية المالية بقيمة ${payment.amount} EGP`,
    entity_type: 'PaymentReceipt',
    entity_id: paymentId,
  });

  return payment;
}

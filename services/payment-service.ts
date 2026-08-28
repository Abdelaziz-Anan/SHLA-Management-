import { Payment, PaymentMethod } from '@/types';
import { store } from '@/lib/store';
import { getCurrentUser } from './auth-service';

export function getPaymentsByGroupStudent(groupStudentId: string): Payment[] {
  const payments = store.getPayments();
  const accounts = store.getAccounts();

  return payments
    .filter(p => p.group_student_id === groupStudentId)
    .map(p => {
      const acc = accounts.find(a => a.id === p.receiving_account_id);
      return { ...p, receiving_account: acc };
    })
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
}

export function recordPayment(data: {
  group_student_id: string;
  amount: number;
  payment_date?: string;
  payment_method: PaymentMethod;
  receiving_account_id: string;
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

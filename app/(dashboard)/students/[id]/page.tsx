'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getGroupStudentById, transferStudentGroup } from '@/services/student-service';
import { getPaymentsByGroupStudent, recordPayment, reversePayment, updatePaymentReceipt } from '@/services/payment-service';
import { getGroups } from '@/services/group-service';
import { store } from '@/lib/store';
import { GroupStudent, Payment, PaymentMethod, Group } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { ReceiptModal } from '@/components/ReceiptModal';
import {
  GraduationCap,
  ArrowRight,
  Plus,
  CreditCard,
  Receipt,
  RotateCcw,
  ArrowRightLeft,
  Calendar,
  User,
  Building,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
} from 'lucide-react';

export default function StudentProfilePage() {
  const params = useParams();
  const gsId = params.id as string;

  const [gs, setGs] = useState<GroupStudent | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // Modal Controls
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activePaymentForReceipt, setActivePaymentForReceipt] = useState<Payment | null>(null);

  // New Payment Form
  const [payAmount, setPayAmount] = useState<number>(500);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Vodafone Cash');
  const [payAccount, setPayAccount] = useState<string>('acc-center-cash');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState<string>('');
  const [payReceiptUrl, setPayReceiptUrl] = useState<string>('');
  const [payError, setPayError] = useState<string>('');

  // Transfer Form
  const [targetGroupId, setTargetGroupId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('تغيير الموعد المناسب للطالب');
  const [transferError, setTransferError] = useState<string>('');

  const loadData = () => {
    if (!gsId) return;
    const detail = getGroupStudentById(gsId);
    setGs(detail);
    if (detail) {
      setPayments(getPaymentsByGroupStudent(detail.id));
    }
    const allGroups = getGroups({ status: 'active' });
    setGroups(allGroups);
    if (allGroups.length > 0 && !targetGroupId) {
      setTargetGroupId(allGroups[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [gsId]);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPayError('');

    if (!payAmount || payAmount <= 0) {
      setPayError('يرجى أدخال مبلغ صحيح أكبر من صفر');
      return;
    }

    try {
      recordPayment({
        group_student_id: gsId,
        amount: Number(payAmount),
        payment_date: payDate,
        payment_method: payMethod,
        receiving_account_id: payAccount,
        receipt_url: payReceiptUrl,
        notes: payNotes,
      });

      setIsPayModalOpen(false);
      setPayNotes('');
      setPayReceiptUrl('');
      loadData();
    } catch (err: any) {
      setPayError(err.message || 'فشل رصد العملية المالية');
    }
  };

  const handleReverse = (paymentId: string) => {
    const reason = prompt('يرجى كتابة سبب تصحيح/إلغاء العملية المالية:');
    if (!reason) return;

    try {
      reversePayment(paymentId, reason);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل إلغاء الدفعة');
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    if (!targetGroupId || !transferReason) {
      setTransferError('يرجى اختيار المجموعة الجديدة وكتابة السبب');
      return;
    }

    try {
      transferStudentGroup(gsId, targetGroupId, transferReason);
      setIsTransferModalOpen(false);
      alert('تم نقل الطالب بنجاح إلى المجموعة الجديدة');
      window.location.href = '/students';
    } catch (err: any) {
      setTransferError(err.message || 'فشل نقل الطالب');
    }
  };

  if (!gs) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold">
        بيانات اشتراك الطالب غير موجودة
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back Link */}
      <Link
        href="/students"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة لجميع الطلاب</span>
      </Link>

      {/* Student Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                معرف الطالب #{gs.student_id.slice(-6)}
              </span>
              <StatusBadge status={gs.payment_status || 'Not Paid'} type="payment" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {gs.student?.full_name}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60" dir="ltr">
                <span>{gs.student?.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 font-bold">
                <span>المجموعة: #{gs.group?.group_number} ({gs.group?.course_name})</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <span>تاريخ الحجز: {formatDate(gs.booking_date)}</span>
              </div>
            </div>
          </div>

          {/* Financial Totals & Actions */}
          <div className="flex flex-col items-start md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="flex items-center gap-6">
              <div className="text-center md:text-left">
                <span className="text-xs font-bold text-slate-400 block">إجمالي المدفوع</span>
                <span className="text-2xl font-black text-emerald-600">
                  {formatCurrency(gs.total_paid || 0)}
                </span>
              </div>

              <div className="text-center md:text-left">
                <span className="text-xs font-bold text-slate-400 block">المتبقي المطلوب</span>
                <span className="text-2xl font-black text-rose-600">
                  {formatCurrency(gs.remaining_balance || 0)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => setIsPayModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل دفعة جديدة</span>
              </button>

              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl transition-all"
              >
                <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                <span>نقل لمجموعة أخرى</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT HISTORY & RECEIPTS TABLE (Requirement #56 - Every payment has its own receipt) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span>سجل الدفعات المالية والإيصالات ({payments.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">كل دفعة لها إيصال منفصل</span>
        </div>

        <div className="overflow-x-auto">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              لا توجد دفعات مسجلة لهذا الطالب حتى الآن
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">المبلغ</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">طريقة الدفع</th>
                  <th className="p-4">جهة الاستلام (Destination)</th>
                  <th className="p-4">الإيصال M-Receipt</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((pay, idx) => (
                  <tr
                    key={pay.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      pay.status === 'reversed' ? 'bg-slate-50/60 opacity-60' : ''
                    }`}
                  >
                    <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-4 font-black text-emerald-600 text-sm">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="p-4 font-medium text-slate-600">{formatDate(pay.payment_date)}</td>
                    <td className="p-4 font-semibold text-slate-800">{pay.payment_method}</td>
                    <td className="p-4 font-bold text-purple-700">
                      {pay.receiving_account?.account_name || 'خزينة السنتر'}
                    </td>
                    <td className="p-4">
                      {pay.receipt_url ? (
                        <button
                          onClick={() => {
                            setActivePaymentForReceipt(pay);
                            setReceiptModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-lg border border-emerald-200 hover:bg-emerald-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض الإيصال</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActivePaymentForReceipt(pay);
                            setReceiptModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 font-bold text-[11px] rounded-lg hover:bg-slate-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>رفع إيصال</span>
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={pay.status} type="payment" />
                    </td>
                    <td className="p-4 text-left">
                      {pay.status === 'valid' && (
                        <button
                          onClick={() => handleReverse(pay.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-semibold border border-rose-200"
                          title="تصحيح وإلغاء الدفعة"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>تصحيح / إلغاء</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>تسجيل دفعة مالية للطالب</span>
              </h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-6 space-y-4 text-xs">
              {payError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold">
                  {payError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المدفوع (EGP) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-base font-black text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الدفع *</label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">طريقة الدفع *</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="Vodafone Cash">Vodafone Cash</option>
                  <option value="Cash">Cash (نقداً)</option>
                  <option value="InstaPay">InstaPay</option>
                  <option value="Bank Transfer">تحويل بنكي</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">جهة استلام النقدية (Payment Destination) *</label>
                <select
                  value={payAccount}
                  onChange={e => setPayAccount(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-purple-700"
                >
                  <option value="acc-center-cash">خزينة السنتر (Center Desk Cash)</option>
                  <option value="acc-mgr-wallet">محفظة المدير (Manager Wallet - 01011112222)</option>
                  <option value="acc-center-instapay">إنستاباي السنتر (Center InstaPay)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  placeholder="مثال: القسط الثاني"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                >
                  تأكيد وحفظ الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                <span>نقل الطالب لمجموعة أخرى</span>
              </h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="mt-6 space-y-4 text-xs">
              {transferError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold">
                  {transferError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">المجموعة المحول إليها *</label>
                <select
                  value={targetGroupId}
                  onChange={e => setTargetGroupId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      مجموعة #{g.group_number} ({g.course_name} - {g.trainer_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب النقل *</label>
                <textarea
                  required
                  rows={3}
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="كتابة سبب نقل الطالب للحفاظ على السجل المالي والملاحظات..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold shadow-md"
                >
                  تأكيد النقل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptModalOpen && activePaymentForReceipt && (
        <ReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => {
            setReceiptModalOpen(false);
            setActivePaymentForReceipt(null);
          }}
          receiptUrl={activePaymentForReceipt.receipt_url}
          onSaveReceipt={(url) => {
            updatePaymentReceipt(activePaymentForReceipt.id, url);
            loadData();
          }}
        />
      )}
    </div>
  );
}

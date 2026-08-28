'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getGroupStudentById, transferStudentGroup } from '@/services/student-service';
import {
  getPaymentsByGroupStudent,
  recordPayment,
  updatePaymentDetails,
  reversePayment,
  updatePaymentReceipt,
} from '@/services/payment-service';
import { getGroups } from '@/services/group-service';
import { store } from '@/lib/store';
import { GroupStudent, Payment, PaymentMethod, Group } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { ReceiptModal } from '@/components/ReceiptModal';
import { useLanguage } from '@/lib/language-context';
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
  Edit2,
} from 'lucide-react';

export default function StudentProfilePage() {
  const params = useParams();
  const gsId = params.id as string;
  const { t } = useLanguage();

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
  const [payAccountOption, setPayAccountOption] = useState<'center_desk' | 'custom'>('center_desk');
  const [payCustomWallet, setPayCustomWallet] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState<string>('');
  const [payReceiptUrl, setPayReceiptUrl] = useState<string>('');
  const [payError, setPayError] = useState<string>('');

  // Edit Payment State
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editPayAmount, setEditPayAmount] = useState<number>(0);
  const [editPayDate, setEditPayDate] = useState<string>('');
  const [editPayMethod, setEditPayMethod] = useState<PaymentMethod>('Vodafone Cash');
  const [editAccountOption, setEditAccountOption] = useState<'center_desk' | 'custom'>('center_desk');
  const [editCustomWallet, setEditCustomWallet] = useState<string>('');
  const [editPayStatus, setEditPayStatus] = useState<'valid' | 'reversed'>('valid');
  const [editPayError, setEditPayError] = useState<string>('');

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

    let finalAccId = 'acc-center-cash';
    let finalCustomAcc = '';

    if (payAccountOption === 'center_desk') {
      finalAccId = 'acc-center-cash';
      finalCustomAcc = 'Center Desk';
    } else {
      if (!payCustomWallet.trim()) {
        setPayError('يرجى كتابة رقم محفظة/حساب التحويل');
        return;
      }
      finalAccId = 'acc-mgr-wallet';
      finalCustomAcc = payCustomWallet.trim();
    }

    try {
      recordPayment({
        group_student_id: gsId,
        amount: Number(payAmount),
        payment_date: payDate,
        payment_method: payMethod,
        receiving_account_id: finalAccId,
        custom_receiving_account: finalCustomAcc,
        receipt_url: payReceiptUrl,
        notes: payNotes,
      });

      setIsPayModalOpen(false);
      setPayNotes('');
      setPayReceiptUrl('');
      setPayCustomWallet('');
      loadData();
    } catch (err: any) {
      setPayError(err.message || 'فشل رصد العملية المالية');
    }
  };

  const handleOpenEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setEditPayAmount(payment.amount);
    setEditPayDate(payment.payment_date);
    setEditPayMethod(payment.payment_method);
    setEditPayStatus(payment.status);

    const customAcc = payment.custom_receiving_account || payment.receiving_account?.account_number || '';
    if (customAcc === 'Center Desk' || customAcc.includes('خزينة')) {
      setEditAccountOption('center_desk');
      setEditCustomWallet('');
    } else {
      setEditAccountOption('custom');
      setEditCustomWallet(customAcc);
    }
    setEditPayError('');
  };

  const handleSaveEditPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setEditPayError('');

    if (!editingPayment) return;
    if (!editPayAmount || editPayAmount <= 0) {
      setEditPayError('يرجى كتابة مبلغ صحيح أكبر من صفر');
      return;
    }

    let finalAccId = 'acc-center-cash';
    let finalCustomAcc = '';

    if (editAccountOption === 'center_desk') {
      finalAccId = 'acc-center-cash';
      finalCustomAcc = 'Center Desk';
    } else {
      if (!editCustomWallet.trim()) {
        setEditPayError('يرجى كتابة رقم محفظة/حساب التحويل');
        return;
      }
      finalAccId = 'acc-mgr-wallet';
      finalCustomAcc = editCustomWallet.trim();
    }

    try {
      updatePaymentDetails(editingPayment.id, {
        amount: Number(editPayAmount),
        payment_date: editPayDate,
        payment_method: editPayMethod,
        receiving_account_id: finalAccId,
        custom_receiving_account: finalCustomAcc,
        status: editPayStatus,
      });

      setEditingPayment(null);
      loadData();
      alert('تم تحديث بيانات الدفعة بنجاح');
    } catch (err: any) {
      setEditPayError(err.message || 'فشل تعديل الدفعة');
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

      {/* PAYMENT HISTORY & RECEIPTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span>سجل الدفعات المالية والإيصالات ({payments.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">إمكانية تعديل أي دفعة أو محفظة فورياً</span>
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
                  <th className="p-4">جهة / محفظة الاستلام</th>
                  <th className="p-4">الإيصال M-Receipt</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-left">الإجراءات والتعديل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((pay, idx) => {
                  const displayAcc = pay.custom_receiving_account || pay.receiving_account?.account_name || 'خزينة السنتر';

                  return (
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
                      <td className="p-4 font-bold text-purple-700" dir="ltr">
                        {displayAcc}
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
                        <button
                          onClick={() => handleOpenEditPayment(pay)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-[11px] font-bold border border-purple-200"
                          title="تعديل تفاصيل هذه الدفعة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>تعديل الدفعة</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* EDIT PAYMENT MODAL (تعديل الدفعة بالكامل) */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-600" />
                <span>تعديل تفاصيل الدفعة المالية</span>
              </h3>
              <button
                onClick={() => setEditingPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPayment} className="mt-6 space-y-4 text-xs">
              {editPayError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold">
                  {editPayError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المدفوع (EGP) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editPayAmount}
                  onChange={e => setEditPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-base font-black text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الدفع *</label>
                <input
                  type="date"
                  required
                  value={editPayDate}
                  onChange={e => setEditPayDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">طريقة الدفع *</label>
                <select
                  value={editPayMethod}
                  onChange={e => setEditPayMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="Vodafone Cash">Vodafone Cash</option>
                  <option value="Cash">Cash (نقداً)</option>
                  <option value="InstaPay">InstaPay</option>
                  <option value="Bank Transfer">تحويل بنكي</option>
                </select>
              </div>

              {/* RECEIVING ACCOUNT / CUSTOM WALLET CHOICE */}
              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-3">
                <label className="block font-bold text-purple-900 mb-1">جهة / محفظة الاستلام</label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="edit_account_choice"
                      checked={editAccountOption === 'center_desk'}
                      onChange={() => setEditAccountOption('center_desk')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span>خزينة السنتر (Center Desk Cash)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="edit_account_choice"
                      checked={editAccountOption === 'custom'}
                      onChange={() => setEditAccountOption('custom')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span>رقم محفظة / حساب آخر (كتابة يدويّة حرة)</span>
                  </label>
                </div>

                {editAccountOption === 'custom' && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <label className="block font-bold text-purple-900 mb-1">
                      اكتب رقم المحفظة / الحساب الذي استلم المبلغ *
                    </label>
                    <input
                      type="text"
                      required
                      value={editCustomWallet}
                      onChange={e => setEditCustomWallet(e.target.value)}
                      placeholder="مثال: 01024274489"
                      className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-sm font-bold text-purple-800"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">حالة الدفعة *</label>
                <select
                  value={editPayStatus}
                  onChange={e => setEditPayStatus(e.target.value as 'valid' | 'reversed')}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="valid">صحيحة ومعتمدة (Valid)</option>
                  <option value="reversed">ملغاة ومسترجعة (Reversed)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

              {/* RECEIVING ACCOUNT / CUSTOM WALLET */}
              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-3">
                <label className="block font-bold text-purple-900 mb-1">جهة / محفظة استلام النقدية</label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="new_pay_acc_choice"
                      checked={payAccountOption === 'center_desk'}
                      onChange={() => setPayAccountOption('center_desk')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span>خزينة السنتر (Center Desk Cash)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="new_pay_acc_choice"
                      checked={payAccountOption === 'custom'}
                      onChange={() => setPayAccountOption('custom')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span>رقم محفظة / حساب آخر (كتابة يدويّة حرة)</span>
                  </label>
                </div>

                {payAccountOption === 'custom' && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <label className="block font-bold text-purple-900 mb-1">
                      اكتب رقم المحفظة / الحساب الذي استلم الدفعة *
                    </label>
                    <input
                      type="text"
                      required
                      value={payCustomWallet}
                      onChange={e => setPayCustomWallet(e.target.value)}
                      placeholder="مثال: 01024274489"
                      className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-sm font-bold text-purple-800"
                      dir="ltr"
                    />
                  </div>
                )}
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

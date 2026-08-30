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
  Phone,
  MessageCircle,
  Clock,
  FileImage,
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
      setPayError('يرجى إدخال مبلغ صحيح أكبر من صفر');
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
      alert('تم تسجيل الدفعة المالية بنجاح');
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

  const handleReverse = (paymentId: string) => {
    const reason = prompt('يرجى كتابة سبب الإلغاء أو التصحيح لهذه الدفعة:');
    if (!reason) return;
    try {
      reversePayment(paymentId, reason);
      loadData();
      alert('تم إلغاء وتصحيح المعاملة بنجاح');
    } catch (e: any) {
      alert(e.message || 'فشل الإلغاء');
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

  const getWhatsAppLink = (phone: string, studentName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(`أهلاً بك يا ${studentName}، نرحب بك من أكاديمية SHLA بخصوص اشتراكك في مجموعة #${gs?.group?.group_number}`);
    return `https://wa.me/${formatted}?text=${msg}`;
  };

  if (!gs) {
    return (
      <div className="p-8 sm:p-12 text-center text-slate-500 font-bold">
        <p>بيانات اشتراك الطالب غير موجودة</p>
        <Link href="/students" className="text-blue-600 font-bold text-xs mt-2 inline-block">
          العودة لدليل الطلاب
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لجميع الطلاب</span>
        </Link>
      </div>

      {/* Student Profile Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
                معرف الطالب #{gs.student_id.slice(-6)}
              </span>
              <StatusBadge status={gs.payment_status || 'Not Paid'} type="payment" />
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3 tracking-tight">
              {gs.student?.full_name}
            </h1>

            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-semibold text-slate-600">
              {/* Phone and WhatsApp */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60" dir="ltr">
                <a href={`tel:${gs.student?.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{gs.student?.phone}</span>
                </a>
                {gs.student?.phone && (
                  <a
                    href={getWhatsAppLink(gs.student.phone, gs.student.full_name)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    title="فتح واتساب"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Group Info Link */}
              <Link
                href={`/groups/${gs.group_id}`}
                className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <span>مجموعة #{gs.group?.group_number} ({gs.group?.course_name})</span>
              </Link>
            </div>
          </div>

          {/* Action Buttons: New Payment & Transfer Group */}
          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-98"
            >
              <CreditCard className="w-4 h-4" />
              <span>تسجيل دفعة مالية</span>
            </button>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              <span>نقل لمجموعة أخرى</span>
            </button>
          </div>
        </div>

        {/* Financial Overview 3-Pill Grid */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-slate-500 text-xs font-bold block">سعر الكورس الإجمالي</span>
            <span className="text-xl font-black text-slate-850 mt-1 block">
              {formatCurrency(gs.course_price || 0)}
            </span>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <span className="text-emerald-800 text-xs font-bold block">إجمالي ما تم سداده</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">
              {formatCurrency(gs.total_paid || 0)}
            </span>
          </div>

          <div className="p-4 bg-gradient-to-br from-rose-50/90 to-rose-100/40 rounded-2xl border border-rose-200/80 shadow-2xs">
            <span className="text-rose-800 text-xs font-bold block">المبلغ المتبقي المطلوب</span>
            <span className="text-xl font-black text-rose-600 mt-1 block">
              {formatCurrency(gs.remaining_balance || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* PAYMENTS HISTORY SECTION (DUAL-VIEW: DESKTOP TABLE + MOBILE CARDS) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <span>سجل دفعات الطالب ({payments.length})</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              كافة الدفعات المحصلة، الإيصالات، وتعديل المبالغ
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400 text-xs font-semibold">
            لا توجد دفعات مالية مسجلة لهذا الطالب بعد
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW (md:hidden) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {payments.map(pay => (
                <div
                  key={pay.id}
                  className={`p-4 space-y-2.5 hover:bg-slate-50/70 transition-colors ${
                    pay.status === 'reversed' ? 'opacity-60 bg-slate-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">#{pay.id.slice(-6)}</span>
                      <p className="font-black text-base text-emerald-600">
                        +{formatCurrency(pay.amount)}
                      </p>
                      <p className="text-[11px] text-slate-400">{formatDate(pay.payment_date)}</p>
                    </div>

                    <StatusBadge status={pay.status} type="payment" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span>جهة الاستلام: <strong className="text-purple-700">{pay.custom_receiving_account || pay.receiving_account?.account_name || 'السنتر'}</strong></span>
                    <span>{pay.payment_method}</span>
                  </div>

                  {pay.notes && (
                    <p className="text-xs text-slate-600 italic">ملاحظة: {pay.notes}</p>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => {
                        setActivePaymentForReceipt(pay);
                        setReceiptModalOpen(true);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 border transition-all ${
                        pay.receipt_url
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {pay.receipt_url ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>معاينة الإيصال</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-slate-500" />
                          <span>رفع إيصال</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEditPayment(pay)}
                      className="py-2 px-3 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-xl border border-purple-200 flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    {pay.status === 'valid' && (
                      <button
                        onClick={() => handleReverse(pay.id)}
                        className="py-2 px-3 text-rose-600 hover:bg-rose-50 rounded-xl font-bold border border-rose-200 flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>إلغاء</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md text-slate-500 font-bold border-b border-slate-200/80 z-10 shadow-2xs">
                  <tr>
                    <th className="p-4">معرف الدفعة</th>
                    <th className="p-4">المبلغ</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">طريقة الدفع</th>
                    <th className="p-4">جهة الاستلام</th>
                    <th className="p-4 text-center">الإيصال</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">ملاحظات</th>
                    <th className="p-4 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.map(pay => {
                    const isReversed = pay.status === 'reversed';
                    const stripeClass = isReversed ? 'border-r-4 border-r-slate-300 bg-slate-50/60 opacity-60' : 'border-r-4 border-r-emerald-500';

                    return (
                      <tr
                        key={pay.id}
                        className={`hover:bg-slate-50/90 transition-colors even:bg-slate-50/40 ${stripeClass}`}
                      >
                      <td className="p-4 font-bold text-slate-400">#{pay.id.slice(-6)}</td>
                      <td className="p-4 font-black text-emerald-600 text-sm">+{formatCurrency(pay.amount)}</td>
                      <td className="p-4 font-medium text-slate-600">{formatDate(pay.payment_date)}</td>
                      <td className="p-4 font-semibold text-slate-800">{pay.payment_method}</td>
                      <td className="p-4 font-bold text-purple-700">
                        {pay.custom_receiving_account || pay.receiving_account?.account_name || 'خزينة السنتر'}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setActivePaymentForReceipt(pay);
                            setReceiptModalOpen(true);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
                            pay.receipt_url
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {pay.receipt_url ? (
                            <>
                              <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                              <span>معاينة</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-slate-500" />
                              <span>رفع</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={pay.status} type="payment" />
                      </td>
                      <td className="p-4 text-slate-500">{pay.notes || '-'}</td>
                      <td className="p-4 text-left flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditPayment(pay)}
                          className="px-2.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-xl border border-purple-200 flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>
                        {pay.status === 'valid' && (
                          <button
                            onClick={() => handleReverse(pay.id)}
                            className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold border border-rose-200 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>إلغاء</span>
                          </button>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* RECORD PAYMENT MODAL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>تسجيل دفعة مالية جديدة للطالب</span>
              </h3>
              <button onClick={() => setIsPayModalOpen(false)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5 text-xs">
              {payError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200">
                  {payError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ (EGP) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={payAmount}
                    onChange={e => setPayAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">المتبقي: {formatCurrency(gs.remaining_balance || 0)}</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الدفع</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">طريقة الدفع</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Vodafone Cash">Vodafone Cash</option>
                  <option value="Cash">نقداً بالسنتر (Cash)</option>
                  <option value="InstaPay">InstaPay</option>
                  <option value="Bank Transfer">تحويل بنكي</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">جهة استلام النقدية (Destination)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayAccountOption('center_desk')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      payAccountOption === 'center_desk'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    خزينة السنتر (Desk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAccountOption('custom')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      payAccountOption === 'custom'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    محفظة كاش أخرى
                  </button>
                </div>

                {payAccountOption === 'custom' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="رقم المحفظة (مثال: 01011112222)"
                      value={payCustomWallet}
                      onChange={e => setPayCustomWallet(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-blue-300 rounded-xl text-xs font-bold text-blue-700"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  placeholder="ملاحظات اختيارية..."
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/25 active:scale-98"
                >
                  تأكيد تسجيل الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PAYMENT MODAL */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-600" />
                <span>تعديل تفاصيل الدفعة #{editingPayment.id.slice(-6)}</span>
              </h3>
              <button onClick={() => setEditingPayment(null)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPayment} className="mt-4 space-y-3.5 text-xs">
              {editPayError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200">
                  {editPayError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ (EGP) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editPayAmount}
                    onChange={e => setEditPayAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-emerald-600 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الدفعة</label>
                  <input
                    type="date"
                    value={editPayDate}
                    onChange={e => setEditPayDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={editPayMethod}
                    onChange={e => setEditPayMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Vodafone Cash">Vodafone Cash</option>
                    <option value="Cash">نقداً بالسنتر (Cash)</option>
                    <option value="InstaPay">InstaPay</option>
                    <option value="Bank Transfer">تحويل بنكي</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">حالة المعاملة</label>
                  <select
                    value={editPayStatus}
                    onChange={e => setEditPayStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="valid">صحيحة ومعتمدة</option>
                    <option value="reversed">ملغاة ومصححة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">جهة استلام النقدية</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditAccountOption('center_desk')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      editAccountOption === 'center_desk'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    خزينة السنتر (Desk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAccountOption('custom')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      editAccountOption === 'custom'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    محفظة كاش أخرى
                  </button>
                </div>

                {editAccountOption === 'custom' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="رقم المحفظة (مثال: 01011112222)"
                      value={editCustomWallet}
                      onChange={e => setEditCustomWallet(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-purple-300 rounded-xl text-xs font-bold text-purple-700"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/25 active:scale-98"
                >
                  حفظ تعديل الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER STUDENT MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-500" />
                <span>نقل الطالب إلى مجموعة أخرى</span>
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="mt-4 space-y-4 text-xs">
              {transferError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200">
                  {transferError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر المجموعة الدراسية الجديدة *</label>
                <select
                  value={targetGroupId}
                  onChange={e => setTargetGroupId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  {groups
                    .filter(g => g.id !== gs.group_id)
                    .map(g => (
                      <option key={g.id} value={g.id}>
                        مجموعة #{g.group_number} ({g.course_name} - {g.trainer_name})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب التحويل / النقل *</label>
                <textarea
                  rows={3}
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="اكتب سبب نقل الطالب للمجموعة الجديدة..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-600/25 active:scale-98"
                >
                  تأكيد النقل للمجموعة
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

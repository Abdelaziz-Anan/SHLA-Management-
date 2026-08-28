'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getGroupById,
  getGroupSessions,
  updateSessionDate,
  toggleSessionStatus,
  addSessionToGroup,
  deleteSessionFromGroup,
} from '@/services/group-service';
import { getGroupStudentsWithDetails, updateStudentEnrollmentDetails } from '@/services/student-service';
import { updatePaymentReceipt } from '@/services/payment-service';
import { Group, GroupSession, GroupStudent, BookingMethod, Payment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { ReceiptModal } from '@/components/ReceiptModal';
import { useLanguage } from '@/lib/language-context';
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Edit2,
  Check,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  CreditCard,
  X,
  Users2,
  Camera,
  FileImage,
  Upload,
} from 'lucide-react';

export default function GroupDetailsPage() {
  const params = useParams();
  const groupId = params.id as string;
  const { t } = useLanguage();

  const [group, setGroup] = useState<Group | null>(null);
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [students, setStudents] = useState<GroupStudent[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newSessionDate, setNewSessionDate] = useState<string>('');

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activePaymentForReceipt, setActivePaymentForReceipt] = useState<Payment | null>(null);

  // Row Edit State
  const [editingRowStudent, setEditingRowStudent] = useState<GroupStudent | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBookingDate, setEditBookingDate] = useState('');
  const [editBookingMethod, setEditBookingMethod] = useState<BookingMethod>('Center');
  const [accountTypeOption, setAccountTypeOption] = useState<'center_desk' | 'custom'>('center_desk');
  const [customWalletNumber, setCustomWalletNumber] = useState('');
  const [editError, setEditError] = useState('');

  const loadData = () => {
    if (!groupId) return;
    const g = getGroupById(groupId);
    setGroup(g);
    setSessions(getGroupSessions(groupId));
    setStudents(getGroupStudentsWithDetails(groupId));
  };

  useEffect(() => {
    loadData();
  }, [groupId]);

  const handleSaveSessionDate = (sessionId: string) => {
    if (!newSessionDate) return;
    try {
      updateSessionDate(sessionId, newSessionDate);
      setEditingSessionId(null);
      loadData();
    } catch (e: any) {
      alert(e.message || 'فشل تعديل التاريخ');
    }
  };

  const handleToggleAttendance = (sessionId: string) => {
    try {
      toggleSessionStatus(sessionId);
      loadData();
    } catch (e: any) {
      alert(e.message || 'فشل تغيير حالة الحضور');
    }
  };

  const handleAddSession = () => {
    try {
      addSessionToGroup(groupId);
      loadData();
    } catch (e: any) {
      alert(e.message || 'فشل إضافة المحاضرة');
    }
  };

  const handleDeleteSession = (sessionId: string, sessionNum: number) => {
    if (!confirm(`هل أنت محتأكد من حذف المحاضرة رقم ${sessionNum}؟`)) return;
    try {
      deleteSessionFromGroup(sessionId);
      loadData();
    } catch (e: any) {
      alert(e.message || 'فشل حذف المحاضرة');
    }
  };

  // Handle Receipt Upload/View Button Click
  const handleOpenReceipt = (gs: GroupStudent) => {
    let firstPay = gs.payments?.[0];
    if (!firstPay) {
      // Create a virtual payment placeholder for receipt upload if no payment exists
      firstPay = {
        id: `pay-receipt-${gs.id}`,
        group_student_id: gs.id,
        amount: gs.total_paid || 0,
        payment_date: gs.booking_date,
        payment_method: 'Vodafone Cash',
        status: 'valid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    setActivePaymentForReceipt(firstPay);
    setReceiptModalOpen(true);
  };

  const handleSaveReceiptUrl = (receiptUrl: string) => {
    if (!activePaymentForReceipt) return;
    try {
      updatePaymentReceipt(activePaymentForReceipt.id, receiptUrl);
      loadData();
      alert('تم حفظ إيصال التحويل بنجاح');
    } catch (e: any) {
      alert(e.message || 'فشل حفظ الإيصال');
    }
  };

  // Open Edit Row Modal
  const handleOpenRowEdit = (gs: GroupStudent) => {
    setEditingRowStudent(gs);
    setEditFullName(gs.student?.full_name || '');
    setEditPhone(gs.student?.phone || '');
    setEditBookingDate(gs.booking_date || '');
    setEditBookingMethod(gs.booking_method || 'Center');

    const currentAccNum = gs.receiving_account_number || '';
    if (currentAccNum === 'Center Desk' || currentAccNum === 'Center Desk Cash' || currentAccNum.includes('خزينة')) {
      setAccountTypeOption('center_desk');
      setCustomWalletNumber('');
    } else {
      setAccountTypeOption('custom');
      setCustomWalletNumber(currentAccNum !== '-' ? currentAccNum : '');
    }
    setEditError('');
  };

  const handleSaveRowEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editingRowStudent) return;
    if (!editFullName || !editPhone) {
      setEditError('يرجى ملء اسم الطالب ورقم الهاتف');
      return;
    }

    let finalReceivingAccId = 'acc-center-cash';
    let finalCustomAcc = '';

    if (accountTypeOption === 'center_desk') {
      finalReceivingAccId = 'acc-center-cash';
      finalCustomAcc = 'Center Desk';
    } else {
      if (!customWalletNumber.trim()) {
        setEditError('يرجى كتابة رقم محفظة/حساب التحويل الذي تريده');
        return;
      }
      finalReceivingAccId = 'acc-mgr-wallet';
      finalCustomAcc = customWalletNumber.trim();
    }

    try {
      updateStudentEnrollmentDetails(editingRowStudent.id, {
        full_name: editFullName,
        phone: editPhone,
        booking_date: editBookingDate,
        booking_method: editBookingMethod,
        receiving_account_id: finalReceivingAccId,
        custom_receiving_account: finalCustomAcc,
      });

      setEditingRowStudent(null);
      loadData();
      alert('تم تعديل بيانات السطر بنجاح');
    } catch (err: any) {
      setEditError(err.message || 'فشل تعديل البيانات');
    }
  };

  if (!group) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="font-bold text-base">{t('المجموعة غير موجودة', 'Group not found')}</p>
        <Link href="/groups" className="text-blue-600 font-semibold text-xs mt-2 inline-block">
          {t('العودة لقائمة المجموعات', 'Back to Groups')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back Link */}
      <Link
        href="/groups"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>{t('العودة إلى كل المجموعات', 'Back to all groups')}</span>
      </Link>

      {/* Group Header Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-sm border border-blue-100">
                {t('مجموعة', 'Group')} #{group.group_number}
              </span>
              <StatusBadge status={group.status} type="group" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {group.course_name} - {group.level}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <User className="w-4 h-4 text-blue-600" />
                <span>{t('المحاضر', 'Instructor')}: {group.trainer_name}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{t('الأيام', 'Days')}: {group.days?.join(' - ')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>{t('الموعد', 'Timing')}: {group.start_time} - {group.end_time}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <span className="text-2xl font-black text-emerald-600">
              {formatCurrency(group.course_price)}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {t('إجمالي الطلاب المقيدين:', 'Total Enrolled Students:')} <strong className="text-slate-900">{students.length} {t('طالب', 'Students')}</strong>
            </span>
            <Link
              href={`/students?action=new&group=${group.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('إضافة طالب للمجموعة', 'Add Student to Group')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SESSION SCHEDULE TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>{t('جدول مواعيد وحضور المحاضرات', 'Sessions Schedule & Attendance')} ({sessions.length} {t('محاضرة', 'Sessions')})</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {t('يمكنك إضافة أو حذف محاضرة وتعديل التاريخ وتحديد حالة الحضور', 'Add/delete sessions, edit dates, and toggle attendance status')}
            </p>
          </div>

          <button
            onClick={handleAddSession}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('إضافة محاضرة جديدة', 'Add New Session')}</span>
          </button>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sessions.map(ses => (
            <div
              key={ses.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative ${
                ses.status === 'completed'
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200/80 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-xs font-bold text-slate-500">
                  {t('المحاضرة', 'Session')} {ses.session_number}
                </span>

                <button
                  onClick={() => handleDeleteSession(ses.id, ses.session_number)}
                  className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title={t('حذف المحاضرة', 'Delete Session')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="my-3 text-center">
                {editingSessionId === ses.id ? (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={newSessionDate}
                      onChange={e => setNewSessionDate(e.target.value)}
                      className="w-full text-xs p-1.5 border rounded-lg"
                    />
                    <button
                      onClick={() => handleSaveSessionDate(ses.id)}
                      className="w-full py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('حفظ', 'Save')}</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-black tracking-tight">{formatDate(ses.session_date)}</p>
                    <button
                      onClick={() => {
                        setEditingSessionId(ses.id);
                        setNewSessionDate(ses.session_date);
                      }}
                      className="mt-1 text-[11px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{t('تعديل التاريخ', 'Edit Date')}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <button
                  onClick={() => handleToggleAttendance(ses.id)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all ${
                    ses.status === 'completed'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {ses.status === 'completed' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>{t('تم الحضور ✔️', 'Attended ✔️')}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-slate-400" />
                      <span>{t('لم تتم بعد (تأكيد الحضور)', 'Mark Attended')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENROLLED STUDENTS TABLE (مع إضافة عمود إيصال التحويل ورقم المحفظة الحر!) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Users2 className="w-5 h-5 text-blue-600" />
              <span>{t('طلاب المجموعة', 'Enrolled Students')} ({students.length})</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {t('إمكانية رفع/معاينة الإيصال مباشرة، وتعديل أي رقم محفظة بحرية', 'Direct receipt upload/viewing and full wallet number customization')}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {students.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              {t('لا يوجد طلاب مسجلين في هذه المجموعة حتى الآن', 'No students enrolled in this group yet')}
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">{t('اسم الطالب', 'Student Name')}</th>
                  <th className="p-4">{t('رقم الهاتف', 'Phone')}</th>
                  <th className="p-4">{t('تاريخ الحجز', 'Booking Date')}</th>
                  <th className="p-4">{t('جهة / وسيلة الحجز', 'Booking Method')}</th>
                  <th className="p-4">{t('رقم حساب / محفظة التحويل', 'Receiving Account / Wallet')}</th>
                  <th className="p-4 text-center">{t('إيصال التحويل', 'Receipt Proof')}</th>
                  <th className="p-4">{t('المبلغ المدفوع', 'Total Paid')}</th>
                  <th className="p-4">{t('المتبقي', 'Remaining')}</th>
                  <th className="p-4">{t('الحالة الماليّة', 'Status')}</th>
                  <th className="p-4 text-left">{t('الإجراءات والتعديل', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((gs, idx) => {
                  const receiptUrl = gs.payments?.[0]?.receipt_url;

                  return (
                    <tr key={gs.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-extrabold text-slate-900">{gs.student?.full_name}</td>
                      <td className="p-4 font-semibold text-slate-600" dir="ltr">{gs.student?.phone}</td>
                      <td className="p-4 text-slate-500">{formatDate(gs.booking_date)}</td>
                      <td className="p-4 font-bold text-slate-800">{gs.booking_method}</td>
                      
                      {/* Receiving Account / Custom Wallet Column */}
                      <td className="p-4 font-extrabold text-purple-700" dir="ltr">
                        {gs.receiving_account_number || '-'}
                      </td>

                      {/* Receipt Upload / View Column */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenReceipt(gs)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition-all border ${
                            receiptUrl
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          {receiptUrl ? (
                            <>
                              <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t('عرض الإيصال 📄', 'View Receipt 📄')}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-purple-600" />
                              <span>{t('رفع إيصال 📷', 'Upload Receipt 📷')}</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-4 font-bold text-emerald-600">{formatCurrency(gs.total_paid || 0)}</td>
                      <td className="p-4 font-bold text-rose-600">{formatCurrency(gs.remaining_balance || 0)}</td>
                      <td className="p-4">
                        <StatusBadge status={gs.payment_status || 'Not Paid'} type="payment" />
                      </td>
                      <td className="p-4 text-left flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenRowEdit(gs)}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-lg transition-colors border border-purple-200 flex items-center gap-1"
                          title={t('تعديل كل بيانات هذا السطر', 'Edit this student row')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{t('تعديل السطر', 'Edit Row')}</span>
                        </button>

                        <Link
                          href={`/students/${gs.id}`}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition-colors border border-blue-200 flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{t('الملف والدفعات', 'Payments')}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* EDIT ROW MODAL (مع الخيار الحر لكتابة أي رقم محفظة!) */}
      {editingRowStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-600" />
                <span>{t('تعديل بيانات سطر الطالب بالكامل', 'Edit Student Row Details')}</span>
              </h3>
              <button
                onClick={() => setEditingRowStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRowEdit} className="mt-6 space-y-4 text-xs">
              {editError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold">
                  {editError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('اسم الطالب *', 'Student Name *')}</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('رقم الهاتف *', 'Phone Number *')}</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('تاريخ الحجز', 'Booking Date')}</label>
                <input
                  type="date"
                  value={editBookingDate}
                  onChange={e => setEditBookingDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('جهة / وسيلة الحجز', 'Booking Method')}</label>
                <select
                  value={editBookingMethod}
                  onChange={e => setEditBookingMethod(e.target.value as BookingMethod)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="Center">Center (من مقر السنتر)</option>
                  <option value="V.cash">V.cash (فودافون كاش)</option>
                  <option value="InstaPay">InstaPay (إنستاباي)</option>
                  <option value="Bank Transfer">تحويل بنكي</option>
                </select>
              </div>

              {/* RECEIVING WALLET / ACCOUNT CHOICE */}
              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-3">
                <label className="block font-bold text-purple-900 mb-1">
                  {t('جهة / محفظة التحويل (Receiving Account)', 'Receiving Account / Wallet')}
                </label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="account_choice"
                      checked={accountTypeOption === 'center_desk'}
                      onChange={() => setAccountTypeOption('center_desk')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span>خزينة السنتر (Center Desk Cash)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="account_choice"
                      checked={accountTypeOption === 'custom'}
                      onChange={() => setAccountTypeOption('custom')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span>رقم محفظة / حساب آخر (كتابة يدويّة حرة)</span>
                  </label>
                </div>

                {accountTypeOption === 'custom' && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <label className="block font-bold text-purple-900 mb-1">
                      {t('اكتب رقم المحفظة / الحساب الذي تم التحويل عليه *', 'Type Custom Wallet/Account Number *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={customWalletNumber}
                      onChange={e => setCustomWalletNumber(e.target.value)}
                      placeholder="مثال: 01024274489 أو 01099998888"
                      className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-sm font-bold text-purple-800"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRowStudent(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
                >
                  {t('حفظ تعديلات السطر', 'Save Row Changes')}
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
          onSaveReceipt={handleSaveReceiptUrl}
          title={`إيصال التحويل - ${students.find(s => s.id === activePaymentForReceipt.group_student_id)?.student?.full_name || 'الطالب'}`}
        />
      )}
    </div>
  );
}

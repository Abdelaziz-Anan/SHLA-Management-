'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { formatCurrency, formatDate, getPaymentStatus } from '@/lib/utils';
import { exportGroupStudentsToCSV } from '@/lib/export-utils';
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
  FileImage,
  Upload,
  Download,
  Phone,
  MessageCircle,
  Eye,
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
  const [editPaidAmount, setEditPaidAmount] = useState<number>(0);
  const [editCoursePrice, setEditCoursePrice] = useState<number>(540);
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
    if (!confirm(`هل أنت متأكد من حذف المحاضرة رقم ${sessionNum}؟`)) return;
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

  // Open Edit Row Modal
  const handleOpenRowEdit = (gs: GroupStudent) => {
    setEditingRowStudent(gs);
    setEditFullName(gs.student?.full_name || '');
    setEditPhone(gs.student?.phone || '');
    setEditBookingDate(gs.booking_date || '');
    setEditBookingMethod(gs.booking_method || 'Center');
    setEditPaidAmount(gs.total_paid || 0);
    setEditCoursePrice(gs.course_price || 540);

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
        setEditError('يرجى كتابة رقم محفظة/حساب التحويل');
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
        paid_amount: Number(editPaidAmount) || 0,
        course_price: Number(editCoursePrice) || 540,
      });

      setEditingRowStudent(null);
      loadData();
      alert('تم تعديل بيانات الطالب والمبالغ المالية بنجاح');
    } catch (err: any) {
      setEditError(err.message || 'فشل تعديل البيانات');
    }
  };

  // Helper for WhatsApp Link
  const getWhatsAppLink = (phone: string, studentName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(`أهلاً بك يا ${studentName}، نرحب بك في أكاديمية SHLA - مجموعة #${group?.group_number}`);
    return `https://wa.me/${formatted}?text=${msg}`;
  };

  if (!group) {
    return (
      <div className="p-8 sm:p-12 text-center text-slate-500 font-bold">
        <p className="text-base">{t('المجموعة غير موجودة', 'Group not found')}</p>
        <Link href="/groups" className="text-blue-600 font-bold text-xs mt-2 inline-block">
          {t('العودة لقائمة المجموعات', 'Back to Groups')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{t('العودة إلى كل المجموعات', 'Back to all groups')}</span>
        </Link>

        {/* CSV Export Button for this Group */}
        <button
          onClick={() => exportGroupStudentsToCSV(group, students)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-98"
          title="تصدير كشف طلاب هذه المجموعة إلى Excel / CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تصدير كشف المجموعة CSV</span>
        </button>
      </div>

      {/* Group Header Info Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-black text-xs sm:text-sm border border-blue-100">
                {t('مجموعة', 'Group')} #{group.group_number}
              </span>
              <StatusBadge status={group.status} type="group" />
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3 tracking-tight">
              {group.course_name} - {group.level}
            </h1>

            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2.5 sm:gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('المحاضر', 'Instructor')}: <strong className="text-slate-800">{group.trainer_name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{group.days?.join(' - ') || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{group.start_time} - {group.end_time}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div>
              <p className="text-[11px] text-slate-400 font-bold">{t('سعر الكورس للطالب', 'Course Price')}</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">
                {formatCurrency(group.course_price)}
              </p>
            </div>
            <div className="mt-1 md:mt-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
              {students.length} {t('طلاب مسجلين', 'enrolled')}
            </div>
          </div>
        </div>
      </div>

      {/* SESSIONS & ATTENDANCE TRACKER */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span>{t('جدول المحاضرات وتأكيد الحضور', 'Sessions & Attendance Tracker')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {sessions.filter(s => s.status === 'completed').length} من {sessions.length} محاضرات تمت
            </p>
          </div>

          <button
            onClick={handleAddSession}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('إضافة محاضرة', 'Add Session')}</span>
          </button>
        </div>

        {/* Sessions Cards Grid (Responsive 2 cols on mobile, up to 4 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
          {sessions.map(ses => (
            <div
              key={ses.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                ses.status === 'completed'
                  ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-black text-slate-800">
                    محاضرة #{ses.session_number}
                  </span>
                  <button
                    onClick={() => handleDeleteSession(ses.id, ses.session_number)}
                    className="text-slate-300 hover:text-rose-600 p-0.5 rounded transition-colors"
                    title="حذف المحاضرة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="my-3">
                  {editingSessionId === ses.id ? (
                    <div className="space-y-1.5">
                      <input
                        type="date"
                        value={newSessionDate}
                        onChange={e => setNewSessionDate(e.target.value)}
                        className="w-full text-xs p-1.5 border rounded-lg bg-white"
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
                      <p className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">{formatDate(ses.session_date)}</p>
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
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <button
                  onClick={() => handleToggleAttendance(ses.id)}
                  className={`w-full py-2 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all ${
                    ses.status === 'completed'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {ses.status === 'completed' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>{t('تمت ✔️', 'Attended')}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('تأكيد الحضور', 'Mark Done')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENROLLED STUDENTS SECTION (DUAL-VIEW: DESKTOP TABLE + MOBILE CARDS) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Users2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span>{t('طلاب المجموعة المسجلين', 'Enrolled Students')} ({students.length})</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              تعديل أسماء الطلاب، الهواتف، المبالغ المسددة، الإيصالات والمحافظ
            </p>
          </div>

          <button
            onClick={() => exportGroupStudentsToCSV(group, students)}
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('تصدير كشف الطلاب', 'Export CSV')}</span>
          </button>
        </div>

        {students.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400 text-xs font-semibold">
            {t('لا يوجد طلاب مسجلين في هذه المجموعة حتى الآن', 'No students enrolled in this group yet')}
          </div>
        ) : (
          <>
            {/* MOBILE INTERACTIVE CARDS VIEW (md:hidden) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {students.map((gs, idx) => {
                const receiptUrl = gs.payments?.[0]?.receipt_url;

                return (
                  <div key={gs.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h3 className="font-black text-sm text-slate-900">{gs.student?.full_name}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1" dir="ltr">
                          <a
                            href={`tel:${gs.student?.phone}`}
                            className="text-xs text-slate-600 font-semibold hover:text-blue-600 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{gs.student?.phone}</span>
                          </a>
                          {gs.student?.phone && (
                            <a
                              href={getWhatsAppLink(gs.student.phone, gs.student.full_name)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 p-1 hover:bg-emerald-50 rounded-lg"
                              title="مراسلة عبر واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={gs.payment_status || 'Not Paid'} type="payment" />
                    </div>

                    {/* Financial Summary Pill */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold block">المبلغ المدفوع</span>
                        <span className="font-black text-emerald-600">{formatCurrency(gs.total_paid || 0)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold block">المتبقي</span>
                        <span className="font-black text-rose-600">{formatCurrency(gs.remaining_balance || 0)}</span>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>حساب الاستلام: <strong className="text-purple-700">{gs.receiving_account_number || 'السنتر'}</strong></span>
                      <span>وسيلة: <strong className="text-slate-700">{gs.booking_method}</strong></span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenReceipt(gs)}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 border transition-all ${
                          receiptUrl
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {receiptUrl ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>عرض الإيصال 📄</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-slate-500" />
                            <span>رفع إيصال 📷</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenRowEdit(gs)}
                        className="py-2 px-4 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs rounded-xl border border-purple-200 flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE VIEW (hidden on mobile, md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">{t('اسم الطالب', 'Student Name')}</th>
                    <th className="p-4">{t('رقم الهاتف', 'Phone')}</th>
                    <th className="p-4">{t('تاريخ الحجز', 'Booking Date')}</th>
                    <th className="p-4">{t('جهة الحجز', 'Method')}</th>
                    <th className="p-4">{t('محفظة التحويل', 'Receiving Wallet')}</th>
                    <th className="p-4 text-center">{t('الإيصال', 'Receipt')}</th>
                    <th className="p-4">{t('المسدد', 'Paid')}</th>
                    <th className="p-4">{t('المتبقي', 'Remaining')}</th>
                    <th className="p-4">{t('الحالة', 'Status')}</th>
                    <th className="p-4 text-left">{t('الإجراءات', 'Actions')}</th>
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
                        <td className="p-4 font-extrabold text-purple-700" dir="ltr">
                          {gs.receiving_account_number || '-'}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleOpenReceipt(gs)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition-all border ${
                              receiptUrl
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {receiptUrl ? (
                              <>
                                <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                                <span>عرض الإيصال 📄</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-slate-500" />
                                <span>رفع إيصال 📷</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-4 font-black text-emerald-600">{formatCurrency(gs.total_paid || 0)}</td>
                        <td className="p-4 font-black text-rose-600">{formatCurrency(gs.remaining_balance || 0)}</td>
                        <td className="p-4">
                          <StatusBadge status={gs.payment_status || 'Not Paid'} type="payment" />
                        </td>
                        <td className="p-4 text-left">
                          <button
                            onClick={() => handleOpenRowEdit(gs)}
                            className="px-2.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-xl transition-colors border border-purple-200 flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>تعديل السطر</span>
                          </button>
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

      {/* EDIT ROW MODAL (RESPONSIVE) */}
      {editingRowStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-600" />
                <span>تعديل بيانات سطر الطالب</span>
              </h3>
              <button
                onClick={() => setEditingRowStudent(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRowEdit} className="mt-4 space-y-3.5 text-xs">
              {editError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الطالب الرباعي *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={e => setEditFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر الكورس للمجموعة</label>
                  <input
                    type="number"
                    value={editCoursePrice}
                    onChange={e => setEditCoursePrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ المسدد (EGP)</label>
                  <input
                    type="number"
                    value={editPaidAmount}
                    onChange={e => setEditPaidAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-600 text-sm"
                  />
                </div>
              </div>

              {/* Destination Account Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">جهة استلام النقدية (Destination)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountTypeOption('center_desk')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      accountTypeOption === 'center_desk'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    خزينة السنتر (Desk)
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountTypeOption('custom')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      accountTypeOption === 'custom'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    محفظة كاش / بنك أخرى
                  </button>
                </div>

                {accountTypeOption === 'custom' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="اكتب رقم المحفظة (مثال: 01011112222)"
                      value={customWalletNumber}
                      onChange={e => setCustomWalletNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-purple-300 rounded-xl text-xs font-bold text-purple-700"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRowStudent(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/25 active:scale-98"
                >
                  حفظ التعديلات
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

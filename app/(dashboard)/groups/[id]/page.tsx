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
import { getGroupStudentsWithDetails } from '@/services/student-service';
import { Group, GroupSession, GroupStudent } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
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
  PhoneCall,
  Users2,
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

      {/* SESSION SCHEDULE TABLE (إدارة وحضور وتعديل وحذف المحاضرات) */}
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
              {/* Card Top: Number & Delete */}
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

              {/* Card Center: Date & Edit */}
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

              {/* Card Bottom: Attendance Toggle Button */}
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

      {/* ENROLLED STUDENTS TABLE (مع إضافة عمود رقم محفظة/حساب التحويل) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            <span>{t('طلاب المجموعة', 'Enrolled Students')} ({students.length})</span>
          </h2>
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
                  <th className="p-4">{t('المبلغ المدفوع', 'Total Paid')}</th>
                  <th className="p-4">{t('المتبقي', 'Remaining')}</th>
                  <th className="p-4">{t('الحالة الماليّة', 'Status')}</th>
                  <th className="p-4 text-left">{t('الإجراءات', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((gs, idx) => (
                  <tr key={gs.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-4 font-extrabold text-slate-900">{gs.student?.full_name}</td>
                    <td className="p-4 font-semibold text-slate-600" dir="ltr">{gs.student?.phone}</td>
                    <td className="p-4 text-slate-500">{formatDate(gs.booking_date)}</td>
                    <td className="p-4 font-bold text-slate-800">{gs.booking_method}</td>
                    <td className="p-4 font-bold text-purple-700" dir="ltr">
                      {gs.receiving_account_number || '-'}
                    </td>
                    <td className="p-4 font-bold text-emerald-600">{formatCurrency(gs.total_paid || 0)}</td>
                    <td className="p-4 font-bold text-rose-600">{formatCurrency(gs.remaining_balance || 0)}</td>
                    <td className="p-4">
                      <StatusBadge status={gs.payment_status || 'Not Paid'} type="payment" />
                    </td>
                    <td className="p-4 text-left">
                      <Link
                        href={`/students/${gs.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{t('الملف والدفعات', 'Profile & Payments')}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

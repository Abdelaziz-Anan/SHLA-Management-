'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getGroupById, getGroupSessions, updateSessionDate } from '@/services/group-service';
import { getGroupStudentsWithDetails } from '@/services/student-service';
import { Group, GroupSession, GroupStudent } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Users2,
  Calendar,
  Clock,
  User,
  BookOpen,
  ArrowRight,
  Edit2,
  Check,
  Plus,
  Phone,
  CreditCard,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

export default function GroupDetailsPage() {
  const params = useParams();
  const groupId = params.id as string;

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

  if (!group) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="font-bold text-base">المجموعة غير موجودة</p>
        <Link href="/groups" className="text-blue-600 font-semibold text-xs mt-2 inline-block">
          العودة لقائمة المجموعات
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
        <span>العودة إلى كل المجموعات</span>
      </Link>

      {/* Group Header Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-sm border border-blue-100">
                مجموعة #{group.group_number}
              </span>
              <StatusBadge status={group.status} type="group" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {group.course_name} - {group.level}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <User className="w-4 h-4 text-blue-600" />
                <span>المحاضر: {group.trainer_name}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>الأيام: {group.days?.join(' - ')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>الموعد: {group.start_time} - {group.end_time}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <span className="text-2xl font-black text-emerald-600">
              {formatCurrency(group.course_price)}
            </span>
            <span className="text-xs font-bold text-slate-500">
              إجمالي الطلاب المقيدين: <strong className="text-slate-900">{students.length} طالب</strong>
            </span>
            <Link
              href={`/students?action=new&group=${group.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طالب للمجموعة</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SESSION SCHEDULE TABLE (جدول وتاريخ المحاضرات) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>جدول مواعيد المحاضرات ({sessions.length} محاضرة)</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">يمكن للمساعد/المدير تعديل تاريخ المحاضرة</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {sessions.map(ses => (
            <div
              key={ses.id}
              className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center flex flex-col justify-between hover:bg-white hover:shadow-xs transition-all"
            >
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                المحاضرة {ses.session_number}
              </span>

              {editingSessionId === ses.id ? (
                <div className="space-y-1 my-1">
                  <input
                    type="date"
                    value={newSessionDate}
                    onChange={e => setNewSessionDate(e.target.value)}
                    className="w-full text-[10px] p-1 border rounded"
                  />
                  <button
                    onClick={() => handleSaveSessionDate(ses.id)}
                    className="w-full py-1 bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>حفظ</span>
                  </button>
                </div>
              ) : (
                <div className="my-1">
                  <p className="text-xs font-extrabold text-slate-900">{formatDate(ses.session_date)}</p>
                  <button
                    onClick={() => {
                      setEditingSessionId(ses.id);
                      setNewSessionDate(ses.session_date);
                    }}
                    className="mt-1 text-[10px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>تعديل</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ENROLLED STUDENTS TABLE (قائمة طلاب المجموعة) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            <span>طلاب المجموعة ({students.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          {students.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              لا يوجد طلاب مسجلين في هذه المجموعة حتى الآن
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">اسم الطالب</th>
                  <th className="p-4">رقم الهاتف</th>
                  <th className="p-4">تاريخ الحجز</th>
                  <th className="p-4">جهة/وسيلة الحجز</th>
                  <th className="p-4">المبلغ المدفوع</th>
                  <th className="p-4">المتبقي</th>
                  <th className="p-4">الحالة الماليّة</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((gs, idx) => (
                  <tr key={gs.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-4 font-extrabold text-slate-900">{gs.student?.full_name}</td>
                    <td className="p-4 font-semibold text-slate-600" dir="ltr">{gs.student?.phone}</td>
                    <td className="p-4 text-slate-500">{formatDate(gs.booking_date)}</td>
                    <td className="p-4 font-medium text-slate-800">{gs.booking_method}</td>
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
                        <span>الملف والدفعات</span>
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

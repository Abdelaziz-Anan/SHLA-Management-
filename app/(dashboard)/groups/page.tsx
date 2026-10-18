'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getGroups, createGroup, deleteGroup, resetAllGroups } from '@/services/group-service';
import { getCurrentUser } from '@/services/auth-service';
import { Group, GroupStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { EditGroupModal } from '@/components/EditGroupModal';
import { exportGroupsToCSV } from '@/lib/export-utils';
import { useLanguage } from '@/lib/language-context';
import {
  Users2,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  BookOpen,
  Filter,
  X,
  ChevronLeft,
  Download,
  Check,
  Trash2,
  AlertTriangle,
  Edit2,
} from 'lucide-react';

const WEEKDAYS = [
  { en: 'Saturday', ar: 'السبت' },
  { en: 'Sunday', ar: 'الأحد' },
  { en: 'Monday', ar: 'الاثنين' },
  { en: 'Tuesday', ar: 'الثلاثاء' },
  { en: 'Wednesday', ar: 'الأربعاء' },
  { en: 'Thursday', ar: 'الخميس' },
  { en: 'Friday', ar: 'الجمعة' },
];

export default function GroupsPage() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const isManager = currentUser?.role === 'manager';

  // Form State for New Group
  const [formData, setFormData] = useState({
    group_number: '',
    course_name: 'General English (Adults)',
    level: 'Level 1',
    trainer_name: 'Dr. Samar',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    start_time: '07:00 PM',
    end_time: '08:30 PM',
    total_sessions: 8,
    course_price: 0,
    days: ['Sunday', 'Wednesday'],
    notes: '',
  });

  const [formError, setFormError] = useState('');

  const loadData = () => {
    setCurrentUser(getCurrentUser());
    const list = getGroups();
    setGroups(list);
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('center_sys_sync', handleSync);

    // Check URL action
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setIsModalOpen(true);
    }

    return () => window.removeEventListener('center_sys_sync', handleSync);
  }, []);

  const handleResetAllGroups = () => {
    try {
      resetAllGroups();
      setIsResetModalOpen(false);
      loadData();
      alert('تم حذف جميع المجموعات والبدء من جديد بنجاح');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حذف المجموعات');
    }
  };

  const handleDeleteGroup = (e: React.MouseEvent, groupId: string, groupNumber: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm(`هل أنتِ متأكدة من حذف المجموعة #${groupNumber}؟`)) return;
    try {
      deleteGroup(groupId);
      loadData();
      alert('تم حذف المجموعة بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل حذف المجموعة');
    }
  };

  const handleOpenEditGroup = (e: React.MouseEvent, g: Group) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingGroup(g);
    setIsEditModalOpen(true);
  };

  // Performance memoization for filtered groups
  const filteredGroups = useMemo(() => {
    let list = groups;

    if (statusFilter !== 'all') {
      list = list.filter(g => g.status === statusFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(g =>
        g.group_number.toLowerCase().includes(term) ||
        g.course_name.toLowerCase().includes(term) ||
        g.trainer_name.toLowerCase().includes(term) ||
        g.level.toLowerCase().includes(term) ||
        g.days?.some(d => d.toLowerCase().includes(term))
      );
    }

    return list;
  }, [groups, search, statusFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.group_number || !formData.course_name || !formData.trainer_name) {
      setFormError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      createGroup({
        group_number: formData.group_number,
        course_name: formData.course_name,
        level: formData.level,
        trainer_name: formData.trainer_name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        total_sessions: Number(formData.total_sessions),
        course_price: Number(formData.course_price),
        status: 'active',
        days: formData.days,
        notes: formData.notes,
      });

      setIsModalOpen(false);
      setFormData({
        group_number: '',
        course_name: 'General English (Adults)',
        level: 'Level 1',
        trainer_name: 'Dr. Samar',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        start_time: '07:00 PM',
        end_time: '08:30 PM',
        total_sessions: 8,
        course_price: 0,
        days: ['Sunday', 'Wednesday'],
        notes: '',
      });
      loadData();
      alert('تم إنشاء المجموعة بنجاح!');
    } catch (err: any) {
      setFormError(err.message || 'فشل إضافة المجموعة');
    }
  };

  const toggleDay = (day: string) => {
    if (formData.days.includes(day)) {
      setFormData({ ...formData, days: formData.days.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, days: [...formData.days, day] });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Users2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>إدارة المجموعات الدراسية</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            البحث عن المجموعات، إنشاء مواعيد جديدة، ورصد الطلاب المسجلين
          </p>
        </div>

        {/* Action Buttons: New Group & CSV Export & Manager Reset */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {isManager && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all active:scale-98"
              title="خاص بالمديرة: حذف جميع المجموعات والبدء من جديد"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>حذف المجموعات والبدء من جديد</span>
            </button>
          )}

          <button
            onClick={() => exportGroupsToCSV(filteredGroups)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            title="تصدير كشف المجموعات إلى Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>مجموعة جديدة</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث برقم المجموعة، المحاضر، الكورس، أو اليوم..."
            className="w-full pr-10 pl-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الحالات ({groups.length})</option>
            <option value="active">نشطة فقط</option>
            <option value="completed">مكتملة</option>
            <option value="archived">مؤرشفة</option>
          </select>
        </div>
      </div>

      {/* Groups Grid (Mobile-First Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center">
            <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-extrabold text-sm sm:text-base">لا توجد مجموعات مطابقة للبحث</p>
            <p className="text-xs text-slate-400 mt-1">جرب تغيير كلمات البحث أو أنشئ مجموعة جديدة</p>
          </div>
        ) : (
          filteredGroups.map(group => (
            <div
              key={group.id}
              className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs hover-lift shine-sweep p-4 sm:p-5 flex flex-col justify-between group overflow-hidden transition-all duration-300 hover:border-blue-300/80"
            >
              {/* Top Accent Light Bar */}
              <div className="absolute top-0 right-0 left-0 h-[2.5px] bg-gradient-to-l from-blue-500 via-blue-400 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Top Card Row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 group-hover:shadow-glow-blue transition-shadow">
                      مجموعة #{group.group_number}
                    </span>
                    <StatusBadge status={group.status} type="group" />
                  </div>
                  <span className="text-xs sm:text-sm font-black text-emerald-600">
                    {formatCurrency(group.course_price)}
                  </span>
                </div>

                {/* Main Details */}
                <div className="mt-3.5 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {group.course_name} - {group.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>المحاضر: <strong className="text-slate-800">{group.trainer_name}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="line-clamp-1">الأيام: <strong className="text-slate-800">{group.days?.join(' - ') || 'غير محدد'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>الوقت: <strong>{group.start_time} - {group.end_time}</strong></span>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                    <span>البدء: {formatDate(group.start_date)}</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100/60">
                      {group.student_count || 0} طلاب مسجلين
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <Link
                  href={`/groups/${group.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <span>فتح كشف المجموعة والجدول</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>

                <button
                  onClick={(e) => handleOpenEditGroup(e, group)}
                  className="p-2.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors"
                  title="تعديل تفاصيل المجموعة"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {isManager && (
                  <button
                    onClick={(e) => handleDeleteGroup(e, group.id, group.group_number)}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl border border-slate-200 hover:border-rose-200 transition-colors"
                    title="حذف المجموعة (المديرة فقط)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE GROUP MODAL (RESPONSIVE 1-COL MOBILE, 2-COL DESKTOP) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-start sm:items-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 my-2 sm:my-auto max-h-[95dvh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-slide-up duration-300">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white flex-shrink-0 z-10">
              <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>إنشاء مجموعة دراسية جديدة</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="overflow-y-auto p-4 sm:p-6 space-y-3.5 text-xs flex-1 overscroll-contain">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم المجموعة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 221"
                    value={formData.group_number}
                    onChange={e => setFormData({ ...formData, group_number: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر الكورس (EGP) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="أدخل السعر (مثال: 800)"
                    value={formData.course_price ? formData.course_price : ''}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, course_price: val === '' ? 0 : Number(val) });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-emerald-600 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الكورس *</label>
                  <input
                    type="text"
                    required
                    value={formData.course_name}
                    onChange={e => setFormData({ ...formData, course_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المستوى (Level)</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المحاضر *</label>
                  <input
                    type="text"
                    required
                    value={formData.trainer_name}
                    onChange={e => setFormData({ ...formData, trainer_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">عدد المحاضرات</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="8"
                    value={formData.total_sessions ? formData.total_sessions : ''}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, total_sessions: val === '' ? 0 : Number(val) });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Days Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">أيام المحاضرات الأسبوعية</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {WEEKDAYS.map(w => {
                    const isSelected = formData.days.includes(w.en);
                    return (
                      <button
                        key={w.en}
                        type="button"
                        onClick={() => toggleDay(w.en)}
                        className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {w.ar}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت البدء</label>
                  <input
                    type="text"
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    placeholder="07:00 PM"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت الانتهاء</label>
                  <input
                    type="text"
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    placeholder="08:30 PM"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ أول محاضرة</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ انتهاء الكورس</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/90 backdrop-blur-sm flex items-center justify-end gap-2 flex-shrink-0 z-10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 active:scale-98 transition-all"
              >
                حفظ وإنشاء المجموعة
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* RESET ALL GROUPS MODAL (MANAGER ONLY) */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 animate-slide-up duration-300">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-center font-black text-lg text-slate-900">
              حذف جميع المجموعات والبدء من جديد
            </h3>
            <p className="text-center text-xs text-slate-500 mt-2 leading-relaxed">
              تحذير: هذا الإجراء مخصص لـ <strong>مديرة الأكاديمية</strong> فقط. سيؤدي هذا الإجراء إلى حذف كافة المجموعات المسجلة والبدء من جديد. لن يمكن التراجع عن هذا الإجراء بعد تنفيذه.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                إلغاء التراجع
              </button>
              <button
                onClick={handleResetAllGroups}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all"
              >
                تأكيد الحذف والبدء من جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT GROUP MODAL */}
      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingGroup(null);
        }}
        group={editingGroup}
        onSuccess={() => {
          loadData();
          alert('تم حفظ وتحديث بيانات المجموعة بنجاح!');
        }}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getGroups, createGroup } from '@/services/group-service';
import { Group, GroupStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
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
    course_price: 540,
    days: ['Sunday', 'Wednesday'],
    notes: '',
  });

  const [formError, setFormError] = useState('');

  const loadData = () => {
    const list = getGroups();
    setGroups(list);
  };

  useEffect(() => {
    loadData();
    // Check URL action
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setIsModalOpen(true);
    }
  }, []);

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

        {/* Action Buttons: New Group & CSV Export */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
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
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href={`/groups/${group.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <span>فتح كشف المجموعة والجدول</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE GROUP MODAL (RESPONSIVE 1-COL MOBILE, 2-COL DESKTOP) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-slide-up duration-300">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>إنشاء مجموعة دراسية جديدة</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
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
                    type="number"
                    required
                    min="0"
                    value={formData.course_price}
                    onChange={e => setFormData({ ...formData, course_price: Number(e.target.value) })}
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
                    type="number"
                    min="1"
                    value={formData.total_sessions}
                    onChange={e => setFormData({ ...formData, total_sessions: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 active:scale-98"
                >
                  حفظ وإنشاء المجموعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

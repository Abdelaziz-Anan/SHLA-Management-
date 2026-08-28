'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getGroups, createGroup } from '@/services/group-service';
import { Group, GroupStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
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
  ChevronRight,
} from 'lucide-react';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for New Group
  const [formData, setFormData] = useState({
    group_number: '',
    course_name: 'E (Adults)',
    level: 'Level 1',
    trainer_name: 'Dr. Samar',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    start_time: '07:00 PM',
    end_time: '08:30 PM',
    total_sessions: 8,
    course_price: 540,
    days: ['Sunday', 'Wednesday'],
    notes: 'Sunday - Wednesday Group [7:00 - 8:30 PM]',
  });

  const [formError, setFormError] = useState('');

  const loadData = () => {
    const list = getGroups({
      search,
      status: statusFilter !== 'all' ? (statusFilter as GroupStatus) : undefined,
    });
    setGroups(list);
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

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
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-7 h-7 text-blue-600" />
            <span>إدارة المجموعات الدراسية</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            البحث عن المجموعات، إنشائها، وتعديل المواعيد والأيام
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>إنشاء مجموعة جديدة</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث برقم المجموعة (221)، الأيام، الوقت، المحاضر، الكورس..."
            className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشطة فقط</option>
            <option value="completed">مكتملة</option>
            <option value="archived">مؤرشفة</option>
          </select>
        </div>
      </div>

      {/* MOBILE GROUP CARDS (MOBILE FIRST DESIGN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold text-base">لا توجد مجموعات مطابقة للبحث</p>
            <p className="text-xs text-slate-400 mt-1">جرب تغيير كلمات البحث أو أضف مجموعة جديدة</p>
          </div>
        ) : (
          groups.map(group => (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Top Card Row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                      مجموعة #{group.group_number}
                    </span>
                    <StatusBadge status={group.status} type="group" />
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600">
                    {formatCurrency(group.course_price)}
                  </span>
                </div>

                {/* Main Details */}
                <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>
                      {group.course_name} - {group.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>المحاضر: <strong className="text-slate-800">{group.trainer_name}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>الأيام: <strong className="text-slate-800">{group.days?.join(' - ') || 'غير محدد'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>الوقت: <strong>{group.start_time} - {group.end_time}</strong></span>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>تاريخ البدء: {formatDate(group.start_date)}</span>
                    <span className="font-semibold text-slate-700">عدد الطلاب: {group.student_count || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/groups/${group.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <span>فتح المجموعة وتعديل الجدول</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>إضافة مجموعة دراسية جديدة</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم المجموعة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 221"
                    value={formData.group_number}
                    onChange={e => setFormData({ ...formData, group_number: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الكورس *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: E (Adults)"
                    value={formData.course_name}
                    onChange={e => setFormData({ ...formData, course_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المستوى Level</label>
                  <input
                    type="text"
                    placeholder="Level 1"
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المحاضر *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Dr. Samar"
                    value={formData.trainer_name}
                    onChange={e => setFormData({ ...formData, trainer_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Days Multi-Select */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">أيام المحاضرات الأسبوعية</label>
                <div className="flex flex-wrap gap-2">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                    const isSelected = formData.days.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت البدء</label>
                  <input
                    type="text"
                    placeholder="07:00 PM"
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت الانتهاء</label>
                  <input
                    type="text"
                    placeholder="08:30 PM"
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر الكورس (EGP) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.course_price}
                    onChange={e => setFormData({ ...formData, course_price: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">عدد المحاضرات</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.total_sessions}
                    onChange={e => setFormData({ ...formData, total_sessions: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20"
                >
                  حفظ وانشاء المجموعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

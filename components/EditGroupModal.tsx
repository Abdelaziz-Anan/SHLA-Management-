'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit2, Check, Calendar, Clock, User, BookOpen, Layers } from 'lucide-react';
import { Group, GroupStatus } from '@/types';
import { updateGroup } from '@/services/group-service';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onSuccess: () => void;
}

const WEEKDAYS = [
  { en: 'Saturday', ar: 'السبت' },
  { en: 'Sunday', ar: 'الأحد' },
  { en: 'Monday', ar: 'الاثنين' },
  { en: 'Tuesday', ar: 'الثلاثاء' },
  { en: 'Wednesday', ar: 'الأربعاء' },
  { en: 'Thursday', ar: 'الخميس' },
  { en: 'Friday', ar: 'الجمعة' },
];

export function EditGroupModal({ isOpen, onClose, group, onSuccess }: EditGroupModalProps) {
  const [formData, setFormData] = useState({
    group_number: '',
    course_name: '',
    level: '',
    trainer_name: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    total_sessions: 8,
    course_price: 0,
    days: [] as string[],
    status: 'active' as GroupStatus,
    notes: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (group && isOpen) {
      setFormData({
        group_number: group.group_number || '',
        course_name: group.course_name || '',
        level: group.level || '',
        trainer_name: group.trainer_name || '',
        start_date: group.start_date || '',
        end_date: group.end_date || '',
        start_time: group.start_time || '',
        end_time: group.end_time || '',
        total_sessions: group.total_sessions || 8,
        course_price: group.course_price || 0,
        days: group.days || [],
        status: group.status || 'active',
        notes: group.notes || '',
      });
      setFormError('');
    }
  }, [group, isOpen]);

  if (!isOpen || !group) return null;

  const toggleDay = (day: string) => {
    if (formData.days.includes(day)) {
      setFormData(prev => ({ ...prev, days: prev.days.filter(d => d !== day) }));
    } else {
      setFormData(prev => ({ ...prev, days: [...prev.days, day] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.group_number.trim() || !formData.course_name.trim() || !formData.trainer_name.trim()) {
      setFormError('يرجى ملء جميع الحقول الإلزامية (رقم المجموعة، اسم الكورس، واسم المحاضر)');
      return;
    }

    try {
      setIsSubmitting(true);
      updateGroup(group.id, {
        group_number: formData.group_number.trim(),
        course_name: formData.course_name.trim(),
        level: formData.level.trim(),
        trainer_name: formData.trainer_name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        total_sessions: Number(formData.total_sessions) || 8,
        course_price: Number(formData.course_price) || 0,
        days: formData.days,
        status: formData.status,
        notes: formData.notes,
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'حدث خطأ أثناء حفظ التعديلات');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-start sm:items-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 my-2 sm:my-auto max-h-[95dvh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-slide-up duration-300">
        
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white flex-shrink-0 z-10">
          <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Edit2 className="w-4 h-4" />
            </div>
            <span>تعديل تفاصيل المجموعة #{group.group_number}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form with Scrollable Body and Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Scrollable Form Content */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-3.5 text-xs flex-1 overscroll-contain">
            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200">
                {formError}
              </div>
            )}

            {/* Group Number & Course Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم المجموعة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 221"
                  value={formData.group_number}
                  onChange={e => setFormData({ ...formData, group_number: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-emerald-600 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Course Name & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الكورس *</label>
                <input
                  type="text"
                  required
                  value={formData.course_name}
                  onChange={e => setFormData({ ...formData, course_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المستوى (Level)</label>
                <input
                  type="text"
                  placeholder="مثال: Level 1"
                  value={formData.level}
                  onChange={e => setFormData({ ...formData, level: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Trainer Name & Total Sessions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المحاضر *</label>
                <input
                  type="text"
                  required
                  value={formData.trainer_name}
                  onChange={e => setFormData({ ...formData, trainer_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Group Status */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">حالة المجموعة</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as GroupStatus })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="active">نشطة (جارية)</option>
                <option value="completed">مكتملة (انتهت)</option>
                <option value="archived">مؤرشفة</option>
              </select>
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

            {/* Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">وقت البدء</label>
                <input
                  type="text"
                  value={formData.start_time}
                  onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                  placeholder="07:00 PM"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">وقت الانتهاء</label>
                <input
                  type="text"
                  value={formData.end_time}
                  onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                  placeholder="08:30 PM"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ أول محاضرة</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ انتهاء الكورس</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية (اختياري)</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات أو تفاصيل خاصة بالمجموعة..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/90 backdrop-blur-sm flex items-center justify-end gap-2 flex-shrink-0 z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 active:scale-98 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

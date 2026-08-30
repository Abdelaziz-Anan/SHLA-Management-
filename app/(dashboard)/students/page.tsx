'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getGroupStudentsWithDetails, addStudentToGroup, checkPhoneDuplicate } from '@/services/student-service';
import { getGroups } from '@/services/group-service';
import { store } from '@/lib/store';
import { GroupStudent, Group, BookingMethod, PaymentMethod } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportStudentsToCSV } from '@/lib/export-utils';
import { StatusBadge } from '@/components/StatusBadge';
import { useLanguage } from '@/lib/language-context';
import {
  GraduationCap,
  Plus,
  Search,
  Phone,
  CreditCard,
  AlertTriangle,
  Receipt,
  ChevronLeft,
  X,
  Download,
  Filter,
  MessageCircle,
} from 'lucide-react';

export default function StudentsPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<GroupStudent[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Fully Paid' | 'Partially Paid' | 'Not Paid'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    group_id: '',
    booking_method: 'Center' as BookingMethod,
    initial_payment_amount: 500,
    payment_method: 'Vodafone Cash' as PaymentMethod,
    receiving_account_id: 'acc-center-cash',
    receipt_url: '',
    notes: '',
  });

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const loadData = () => {
    setStudents(getGroupStudentsWithDetails());
    const activeGroups = getGroups({ status: 'active' });
    setGroups(activeGroups);
    if (activeGroups.length > 0 && !formData.group_id) {
      setFormData(prev => ({ ...prev, group_id: activeGroups[0].id }));
    }
  };

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setIsModalOpen(true);
    }
  }, []);

  // Optimized memoized filter
  const filteredStudents = useMemo(() => {
    let list = students;

    if (statusFilter !== 'all') {
      list = list.filter(s => s.payment_status === statusFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        s =>
          (s.student?.full_name && s.student.full_name.toLowerCase().includes(term)) ||
          (s.student?.phone && s.student.phone.includes(term)) ||
          (s.group?.group_number && s.group.group_number.includes(term)) ||
          (s.group?.course_name && s.group.course_name.toLowerCase().includes(term))
      );
    }

    return list;
  }, [students, search, statusFilter]);

  const handlePhoneChange = (phoneVal: string) => {
    setFormData(prev => ({ ...prev, phone: phoneVal }));
    const existing = checkPhoneDuplicate(phoneVal);
    if (existing) {
      setDuplicateWarning(`ملاحظة: هذا الرقم مسجل مسبقاً باسم الطالب "${existing.full_name}".`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.full_name || !formData.phone || !formData.group_id) {
      setFormError('يرجى كتابة الاسم ورقم الهاتف واختيار المجموعة');
      return;
    }

    try {
      addStudentToGroup({
        full_name: formData.full_name,
        phone: formData.phone,
        group_id: formData.group_id,
        booking_method: formData.booking_method,
        initial_payment: formData.initial_payment_amount > 0 ? {
          amount: Number(formData.initial_payment_amount),
          payment_method: formData.payment_method,
          receiving_account_id: formData.receiving_account_id,
          receipt_url: formData.receipt_url,
        } : undefined,
        notes: formData.notes,
      });

      setIsModalOpen(false);
      setFormData({
        full_name: '',
        phone: '',
        group_id: groups[0]?.id || '',
        booking_method: 'Center',
        initial_payment_amount: 500,
        payment_method: 'Vodafone Cash',
        receiving_account_id: 'acc-center-cash',
        receipt_url: '',
        notes: '',
      });
      loadData();
      alert('تم تسجيل الطالب بنجاح!');
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ في إضافة الطالب');
    }
  };

  const getWhatsAppLink = (phone: string, studentName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(`أهلاً بك يا ${studentName}، نتواصل معك من أكاديمية SHLA بخصوص اشتراكك.`);
    return `https://wa.me/${formatted}?text=${msg}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>دليل الطلاب والاشتراكات</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            دليل الطلاب المسجلين، فحص الأرقام، وتتبع المبالغ المتبقية
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => exportStudentsToCSV(filteredStudents)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            title="تصدير كشف الطلاب إلى Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم الطالب، رقم الهاتف، أو رقم المجموعة..."
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

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({students.length})
          </button>

          <button
            onClick={() => setStatusFilter('Fully Paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              statusFilter === 'Fully Paid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            مسدد بالكامل
          </button>

          <button
            onClick={() => setStatusFilter('Partially Paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              statusFilter === 'Partially Paid'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            سداد جزئي
          </button>

          <button
            onClick={() => setStatusFilter('Not Paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              statusFilter === 'Not Paid'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            غير مدفوع
          </button>
        </div>
      </div>

      {/* STUDENT CARDS (RESPONSIVE GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-extrabold text-sm sm:text-base">لا يوجد طلاب مطبق عليهم البحث</p>
            <p className="text-xs text-slate-400 mt-1">تأكد من شروط البحث أو الفلاتر المحددة</p>
          </div>
        ) : (
          filteredStudents.map(gs => {
            const isPaid = gs.payment_status === 'Fully Paid';
            const isPartial = gs.payment_status === 'Partially Paid';
            const statusLightBar = isPaid
              ? 'from-emerald-500 via-emerald-400 to-transparent'
              : isPartial
              ? 'from-amber-500 via-amber-400 to-transparent'
              : 'from-rose-500 via-rose-400 to-transparent';

            return (
              <div
                key={gs.id}
                className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs hover-lift shine-sweep p-4 sm:p-5 flex flex-col justify-between group overflow-hidden transition-all duration-300"
              >
                {/* Top Accent Light Bar */}
                <div className={`absolute top-0 right-0 left-0 h-[2.5px] bg-gradient-to-l ${statusLightBar} opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="overflow-hidden pr-1">
                    <h3 className="font-black text-sm sm:text-base text-slate-900 truncate">
                      {gs.student?.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1" dir="ltr">
                      <a
                        href={`tel:${gs.student?.phone}`}
                        className="text-xs text-slate-500 font-semibold hover:text-blue-600 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{gs.student?.phone}</span>
                      </a>
                      {gs.student?.phone && (
                        <a
                          href={getWhatsAppLink(gs.student.phone, gs.student.full_name)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 p-0.5 hover:bg-emerald-50 rounded"
                          title="واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={gs.payment_status || 'Not Paid'} type="payment" />
                </div>

                {/* Info Pills */}
                <div className="mt-3.5 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-semibold text-[11px]">المجموعة:</span>
                    <span className="font-black text-blue-700 truncate max-w-[170px]">
                      #{gs.group?.group_number} ({gs.group?.course_name})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">المسدد:</span>
                    <span className="font-black text-emerald-600 text-sm">{formatCurrency(gs.total_paid || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">المتبقي:</span>
                    <span className="font-black text-rose-600 text-sm">{formatCurrency(gs.remaining_balance || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>وسيلة: {gs.booking_method}</span>
                    <span>{formatDate(gs.booking_date)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href={`/students/${gs.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs rounded-xl transition-all active:scale-98"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>الملف الشخصي وتسجيل الدفعات</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* ADD STUDENT MODAL (RESPONSIVE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>تسجيل طالب جديد بالسنتر</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200">
                  {formError}
                </div>
              )}

              {duplicateWarning && (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl font-bold flex items-center gap-2 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الطالب الرباعي *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد علي محمود"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    placeholder="010XXXXXXXX"
                    value={formData.phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المجموعة الدراسية *</label>
                  <select
                    value={formData.group_id}
                    onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        مجموعة #{g.group_number} ({g.course_name} - {g.trainer_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة الحجز</label>
                  <select
                    value={formData.booking_method}
                    onChange={e => setFormData({ ...formData, booking_method: e.target.value as BookingMethod })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Center">Center (من مقر السنتر)</option>
                    <option value="V.cash">V.cash (فودافون كاش)</option>
                    <option value="InstaPay">InstaPay (إنستاباي)</option>
                    <option value="Bank Transfer">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              {/* Initial Payment */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>الدفعة المبدئية عند التسجيل</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">المبلغ المدفوع (EGP)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.initial_payment_amount}
                      onChange={e => setFormData({ ...formData, initial_payment_amount: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-200 rounded-xl font-black text-emerald-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">وسيلة الدفع</label>
                    <select
                      value={formData.payment_method}
                      onChange={e => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
                    >
                      <option value="Vodafone Cash">Vodafone Cash</option>
                      <option value="Cash">نقداً بالسنتر</option>
                      <option value="InstaPay">InstaPay</option>
                      <option value="Bank Transfer">تحويل بنكي</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">جهة استلام النقدية (Destination) *</label>
                  <select
                    value={formData.receiving_account_id}
                    onChange={e => setFormData({ ...formData, receiving_account_id: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-800 bg-white text-xs"
                  >
                    <option value="acc-center-cash">خزينة السنتر (Center Desk Cash)</option>
                    <option value="acc-mgr-wallet">محفظة المدير (Manager Wallet - 01011112222)</option>
                    <option value="acc-center-instapay">إنستاباي السنتر (Center InstaPay)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 active:scale-98"
                >
                  تأكيد وتسجيل الطالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

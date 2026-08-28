'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getGroupStudentsWithDetails, addStudentToGroup, checkPhoneDuplicate } from '@/services/student-service';
import { getGroups } from '@/services/group-service';
import { store } from '@/lib/store';
import { GroupStudent, Group, BookingMethod, PaymentMethod } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import {
  GraduationCap,
  Plus,
  Search,
  Phone,
  CreditCard,
  AlertTriangle,
  Receipt,
  ChevronRight,
  ArrowRightLeft,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<GroupStudent[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
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
    setStudents(getGroupStudentsWithDetails(undefined, search));
    const activeGroups = getGroups({ status: 'active' });
    setGroups(activeGroups);
    if (activeGroups.length > 0 && !formData.group_id) {
      setFormData(prev => ({ ...prev, group_id: activeGroups[0].id }));
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handlePhoneChange = (phoneVal: string) => {
    setFormData(prev => ({ ...prev, phone: phoneVal }));
    const existing = checkPhoneDuplicate(phoneVal);
    if (existing) {
      setDuplicateWarning(`ملاحظة: هذا الرقم مسجل بالفعل باسم الطالب "${existing.full_name}". سيتم ربط التسجيل بنفس حساب الطالب.`);
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
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ في إضافة الطالب');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            <span>إدارة الطلاب والاشتراكات</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            دليل الطلاب الشامل، رصد الدفعات المالية، وفحص الهواتف المكررة
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-5 h-5 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم الطالب، رقم الهاتف، أو رقم المجموعة..."
            className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* MOBILE STUDENT CARDS (Requirement #49) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {students.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold text-base">لا يوجد طلاب مطبق عليهم البحث</p>
          </div>
        ) : (
          students.map(gs => (
            <div
              key={gs.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="overflow-hidden pr-2">
                    <h3 className="font-extrabold text-base text-slate-900 truncate">
                      {gs.student?.full_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5" dir="ltr">
                      {gs.student?.phone}
                    </p>
                  </div>
                  <StatusBadge status={gs.payment_status || 'Not Paid'} type="payment" />
                </div>

                {/* Info List */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-semibold">المجموعة:</span>
                    <span className="font-bold text-blue-700">#{gs.group?.group_number} ({gs.group?.course_name})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">المبلغ المدفوع:</span>
                    <span className="font-extrabold text-emerald-600">{formatCurrency(gs.total_paid || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">المتبقي:</span>
                    <span className="font-extrabold text-rose-600">{formatCurrency(gs.remaining_balance || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>وسيلة الحجز: {gs.booking_method}</span>
                    <span>{formatDate(gs.booking_date)}</span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <Link
                  href={`/students/${gs.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs rounded-xl transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>الملف الشخصي وتسجيل الدفعات</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD STUDENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>تسجيل طالب جديد بالسنتر</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold">
                  {formError}
                </div>
              )}

              {duplicateWarning && (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl font-semibold flex items-center gap-2 border border-amber-200">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الطالب الرباعي *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد علي محمود"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
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
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المجموعة الدراسية *</label>
                  <select
                    value={formData.group_id}
                    onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        مجموعة #{g.group_number} ({g.course_name} - {g.trainer_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة/وسيلة الحجز</label>
                  <select
                    value={formData.booking_method}
                    onChange={e => setFormData({ ...formData, booking_method: e.target.value as BookingMethod })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Center">Center (من مقر السنتر)</option>
                    <option value="V.cash">V.cash (فودافون كاش)</option>
                    <option value="InstaPay">InstaPay (إنستاباي)</option>
                    <option value="Bank Transfer">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              {/* Initial Payment Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>الدفعة المبدئية عند التسجيل</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">المبلغ المدفوع (EGP)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.initial_payment_amount}
                      onChange={e => setFormData({ ...formData, initial_payment_amount: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-200 rounded-xl font-bold text-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">وسيلة الدفع</label>
                    <select
                      value={formData.payment_method}
                      onChange={e => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                      className="w-full p-2 border border-slate-200 rounded-xl"
                    >
                      <option value="Vodafone Cash">Vodafone Cash</option>
                      <option value="Cash">نقداً بالسنتر</option>
                      <option value="InstaPay">InstaPay</option>
                      <option value="Bank Transfer">تحويل بنكي</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">جهة استلام النقدية (Payment Destination) *</label>
                  <select
                    value={formData.receiving_account_id}
                    onChange={e => setFormData({ ...formData, receiving_account_id: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="acc-center-cash">خزينة السنتر (Center Desk Cash)</option>
                    <option value="acc-mgr-wallet">محفظة المدير (Manager Wallet - 01011112222)</option>
                    <option value="acc-center-instapay">إنستاباي السنتر (Center InstaPay)</option>
                  </select>
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

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { store } from '@/lib/store';
import { getGroupStudentsWithDetails } from '@/services/student-service';
import { reversePayment, updatePaymentReceipt, deletePayment, deleteAllPayments } from '@/services/payment-service';
import { getCurrentUser } from '@/services/auth-service';
import { Payment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportPaymentsToCSV } from '@/lib/export-utils';
import { StatusBadge } from '@/components/StatusBadge';
import { ReceiptModal } from '@/components/ReceiptModal';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Plus,
  Building,
  Download,
  X,
  FileImage,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function PaymentsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'reversed'>('all');
  const [activePaymentForReceipt, setActivePaymentForReceipt] = useState<Payment | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const isManager = currentUser?.role === 'manager';

  const loadData = () => {
    setCurrentUser(getCurrentUser());
    const allPayments = store.getPayments();
    const groupStudents = getGroupStudentsWithDetails();
    const accounts = store.getAccounts();

    const enriched = allPayments.map(p => {
      const gs = groupStudents.find(g => g.id === p.group_student_id);
      const acc = accounts.find(a => a.id === p.receiving_account_id);
      return { ...p, groupStudent: gs, receiving_account: acc };
    });

    setPayments(enriched);
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('center_sys_sync', handleSync);
    return () => window.removeEventListener('center_sys_sync', handleSync);
  }, []);

  // Performance-optimized filter
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    if (methodFilter !== 'all') {
      filtered = filtered.filter(p => p.payment_method === methodFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        p =>
          (p.groupStudent?.student?.full_name && p.groupStudent.student.full_name.toLowerCase().includes(term)) ||
          (p.groupStudent?.group?.group_number && p.groupStudent.group.group_number.includes(term)) ||
          p.payment_method.toLowerCase().includes(term) ||
          (p.custom_receiving_account && p.custom_receiving_account.toLowerCase().includes(term)) ||
          (p.receiving_account?.account_name && p.receiving_account.account_name.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  }, [payments, search, methodFilter, statusFilter]);

  const handleReverse = (paymentId: string) => {
    const reason = prompt('يرجى كتابة سبب الإلغاء أو التصحيح لهذه الدفعة المالية:');
    if (!reason) return;
    try {
      reversePayment(paymentId, reason);
      loadData();
      alert('تم إلغاء وتصحيح المعاملة المالية');
    } catch (e: any) {
      alert(e.message || 'فشل عملية التصحيح');
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذه المعاملة المالية نهائياً؟')) return;
    try {
      deletePayment(paymentId);
      loadData();
      alert('تم حذف المعاملة المالية بنجاح');
    } catch (e: any) {
      alert(e.message || 'فشل حذف المعاملة');
    }
  };

  const handleResetAllPayments = () => {
    try {
      deleteAllPayments();
      setIsResetModalOpen(false);
      loadData();
      alert('تم حذف كافة المعاملات والبدء من جديد بنجاح');
    } catch (e: any) {
      alert(e.message || 'فشل حذف المعاملات');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>سجل المعاملات المالية والإيصالات</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            سجل كافة المعاملات المالية بالأكاديمية، فحص الإيصالات، وتتبع المحافظ
          </p>
        </div>

        {/* Buttons: Manager Reset & CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {isManager && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all active:scale-98"
              title="خاص بالمديرة: حذف كافة المعاملات والبدء من جديد"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>حذف المعاملات والبدء من جديد</span>
            </button>
          )}

          <button
            onClick={() => exportPaymentsToCSV(filteredPayments)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            title="تصدير كشف المعاملات إلى Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>تصدير سجل المدفوعات CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم الطالب، رقم المجموعة، أو المحفظة..."
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
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كل الطرق</option>
            <option value="Vodafone Cash">Vodafone Cash</option>
            <option value="Cash">Cash (نقداً)</option>
            <option value="InstaPay">InstaPay</option>
            <option value="Bank Transfer">تحويل بنكي</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كل الحالات</option>
            <option value="valid">معتمدة فقط</option>
            <option value="reversed">ملغاة/مصححة</option>
          </select>
        </div>
      </div>

      {/* DUAL VIEW: MOBILE CARDS (lg:hidden) + DESKTOP TABLE (hidden lg:block) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400 text-xs font-semibold">
            لا توجد عمليات مالية مطابقة للبحث
          </div>
        ) : (
          <>
            {/* MOBILE PAYMENT CARDS */}
            <div className="block lg:hidden divide-y divide-slate-100">
              {filteredPayments.map(pay => (
                <div
                  key={pay.id}
                  className={`p-4 space-y-3 hover:bg-slate-50/70 transition-colors ${
                    pay.status === 'reversed' ? 'opacity-60 bg-slate-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">#{pay.id.slice(-6)}</span>
                      <h3 className="font-black text-sm text-slate-900">
                        {pay.groupStudent?.student?.full_name || 'طالب'}
                      </h3>
                      <p className="text-xs text-blue-600 font-bold mt-0.5">
                        مجموعة #{pay.groupStudent?.group?.group_number || '-'}
                      </p>
                    </div>

                    <div className="text-left">
                      <p className="font-black text-base text-emerald-600">
                        +{formatCurrency(pay.amount)}
                      </p>
                      <StatusBadge status={pay.status} type="payment" className="mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span>جهة الاستلام: <strong className="text-purple-700">{pay.custom_receiving_account || pay.receiving_account?.account_name || 'الأكاديمية'}</strong></span>
                    <span>{pay.payment_method}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[11px]">{formatDate(pay.payment_date)}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActivePaymentForReceipt(pay);
                          setReceiptModalOpen(true);
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs border ${
                          pay.receipt_url
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {pay.receipt_url ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>الإيصال</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-slate-500" />
                            <span>رفع</span>
                          </>
                        )}
                      </button>

                      {pay.status === 'valid' && (
                        <button
                          onClick={() => handleReverse(pay.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>إلغاء</span>
                        </button>
                      )}

                      {isManager && (
                        <button
                          onClick={() => handleDeletePayment(pay.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200"
                          title="حذف نهائي (المديرة فقط)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP FULL TABLE */}
            <div className="hidden lg:block overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md text-slate-500 font-bold border-b border-slate-200/80 z-10 shadow-2xs">
                  <tr>
                    <th className="p-4">معرف العملية</th>
                    <th className="p-4">اسم الطالب</th>
                    <th className="p-4">المجموعة</th>
                    <th className="p-4">المبلغ</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">وسيلة الدفع</th>
                    <th className="p-4">جهة الاستلام</th>
                    <th className="p-4 text-center">الإيصال</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPayments.map(pay => {
                    const isReversed = pay.status === 'reversed';
                    const stripeClass = isReversed ? 'border-r-4 border-r-slate-300 bg-slate-50/60 opacity-60' : 'border-r-4 border-r-emerald-500';

                    return (
                      <tr
                        key={pay.id}
                        className={`hover:bg-slate-50/90 transition-colors even:bg-slate-50/40 ${stripeClass}`}
                      >
                      <td className="p-4 font-bold text-slate-400">#{pay.id.slice(-6)}</td>
                      <td className="p-4 font-black text-slate-900">
                        {pay.groupStudent?.student?.full_name || 'طالب'}
                      </td>
                      <td className="p-4 font-bold text-blue-700">
                        مجموعة #{pay.groupStudent?.group?.group_number || '-'}
                      </td>
                      <td className="p-4 font-black text-emerald-600 text-sm">
                        +{formatCurrency(pay.amount)}
                      </td>
                      <td className="p-4 font-medium text-slate-600">{formatDate(pay.payment_date)}</td>
                      <td className="p-4 font-semibold text-slate-800">{pay.payment_method}</td>
                      <td className="p-4 font-bold text-purple-700">
                        {pay.custom_receiving_account || pay.receiving_account?.account_name || 'خزينة الأكاديمية'}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setActivePaymentForReceipt(pay);
                            setReceiptModalOpen(true);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
                            pay.receipt_url
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {pay.receipt_url ? (
                            <>
                              <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                              <span>معاينة الإيصال</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-slate-500" />
                              <span>رفع إيصال</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={pay.status} type="payment" />
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {pay.status === 'valid' && (
                            <button
                              onClick={() => handleReverse(pay.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>إلغاء وتصحيح</span>
                            </button>
                          )}
                          {isManager && (
                            <button
                              onClick={() => handleDeletePayment(pay.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200 transition-colors"
                              title="حذف المعاملة نهائياً (المديرة فقط)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
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

      {/* RESET ALL PAYMENTS MODAL (MANAGER ONLY) */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 animate-slide-up duration-300">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-center font-black text-lg text-slate-900">
              حذف كافة المعاملات المالية والبدء من جديد
            </h3>
            <p className="text-center text-xs text-slate-500 mt-2 leading-relaxed">
              تحذير: هذا الإجراء مخصص لـ <strong>مديرة الأكاديمية</strong> فقط. سيؤدي هذا الإجراء إلى حذف جميع سجلات المدفوعات المسجلة والبدء من جديد. لن يمكن التراجع بعد التنفيذ.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                إلغاء التراجع
              </button>
              <button
                onClick={handleResetAllPayments}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all"
              >
                تأكيد الحذف والبدء من جديد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

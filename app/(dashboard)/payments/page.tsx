'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { store } from '@/lib/store';
import { getGroupStudentsWithDetails } from '@/services/student-service';
import { reversePayment, updatePaymentReceipt } from '@/services/payment-service';
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
} from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'reversed'>('all');
  const [activePaymentForReceipt, setActivePaymentForReceipt] = useState<Payment | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const loadData = () => {
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
            سجل كافة المعاملات المالية بالسنتر، فحص الإيصالات، وتتبع المحافظ
          </p>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={() => exportPaymentsToCSV(filteredPayments)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-98"
          title="تصدير كشف المعاملات إلى Excel / CSV"
        >
          <Download className="w-4 h-4" />
          <span>تصدير سجل المدفوعات CSV</span>
        </button>
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
                    <span>جهة الاستلام: <strong className="text-purple-700">{pay.custom_receiving_account || pay.receiving_account?.account_name || 'السنتر'}</strong></span>
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
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP FULL TABLE */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
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
                  {filteredPayments.map(pay => (
                    <tr
                      key={pay.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        pay.status === 'reversed' ? 'bg-slate-50/60 opacity-60' : ''
                      }`}
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
                        {pay.custom_receiving_account || pay.receiving_account?.account_name || 'خزينة السنتر'}
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
                        {pay.status === 'valid' && (
                          <button
                            onClick={() => handleReverse(pay.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>إلغاء وتصحيح</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
}

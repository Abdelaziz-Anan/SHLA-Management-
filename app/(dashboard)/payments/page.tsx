'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { getGroupStudentsWithDetails } from '@/services/student-service';
import { reversePayment, updatePaymentReceipt } from '@/services/payment-service';
import { Payment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
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
  CheckCircle2,
} from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
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

    let filtered = enriched;

    if (methodFilter !== 'all') {
      filtered = filtered.filter(p => p.payment_method === methodFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        p =>
          (p.groupStudent?.student?.full_name && p.groupStudent.student.full_name.toLowerCase().includes(term)) ||
          (p.groupStudent?.group?.group_number && p.groupStudent.group.group_number.includes(term)) ||
          p.payment_method.toLowerCase().includes(term) ||
          (p.receiving_account?.account_name && p.receiving_account.account_name.toLowerCase().includes(term))
      );
    }

    filtered.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
    setPayments(filtered);
  };

  useEffect(() => {
    loadData();
  }, [search, methodFilter]);

  const handleReverse = (paymentId: string) => {
    const reason = prompt('يرجى كتابة سبب الإلغاء/التصحيح لهذه العملية المالّية:');
    if (!reason) return;
    try {
      reversePayment(paymentId, reason);
      loadData();
    } catch (e: any) {
      alert(e.message || 'فشل عملية التصحيح');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-blue-600" />
            <span>سجل المعاملات المالية والإيصالات</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            عرض كافة العمليات المالية المسجلة بالسنتر ومتابعة الإيصالات والمحافظ
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم الطالب، رقم المجموعة، أو المحفظة..."
            className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">جميع الطرق</option>
            <option value="Vodafone Cash">Vodafone Cash</option>
            <option value="Cash">Cash (نقداً)</option>
            <option value="InstaPay">InstaPay</option>
            <option value="Bank Transfer">تحويل بنكي</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              لا توجد عمليات مالية مطابقة للبحث
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">معرف العملية</th>
                  <th className="p-4">اسم الطالب</th>
                  <th className="p-4">المجموعة</th>
                  <th className="p-4">المبلغ</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">وسيلة الدفع</th>
                  <th className="p-4">جهة الاستلام (Destination)</th>
                  <th className="p-4">الإيصال</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map(pay => (
                  <tr
                    key={pay.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      pay.status === 'reversed' ? 'bg-slate-50/60 opacity-60' : ''
                    }`}
                  >
                    <td className="p-4 font-bold text-slate-400">#{pay.id.slice(-6)}</td>
                    <td className="p-4 font-extrabold text-slate-900">
                      {pay.groupStudent?.student?.full_name || 'طالب'}
                    </td>
                    <td className="p-4 font-bold text-blue-700">
                      مجموعة #{pay.groupStudent?.group?.group_number || '-'}
                    </td>
                    <td className="p-4 font-black text-emerald-600 text-sm">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="p-4 font-medium text-slate-600">{formatDate(pay.payment_date)}</td>
                    <td className="p-4 font-semibold text-slate-800">{pay.payment_method}</td>
                    <td className="p-4 font-bold text-purple-700">
                      {pay.receiving_account?.account_name || 'خزينة السنتر'}
                    </td>
                    <td className="p-4">
                      {pay.receipt_url ? (
                        <button
                          onClick={() => {
                            setActivePaymentForReceipt(pay);
                            setReceiptModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-lg border border-emerald-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>الإيصال</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActivePaymentForReceipt(pay);
                            setReceiptModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 font-bold text-[11px] rounded-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>رفع</span>
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={pay.status} type="payment" />
                    </td>
                    <td className="p-4 text-left">
                      {pay.status === 'valid' && (
                        <button
                          onClick={() => handleReverse(pay.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-semibold border border-rose-200"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>إلغاء وتصحيح</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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

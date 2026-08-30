'use client';

import React, { useState, useEffect } from 'react';
import { getFinanceSummary, getSettlementHistory, recordSettlement } from '@/services/finance-service';
import { FinanceSummary, Settlement } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportSettlementsToCSV } from '@/lib/export-utils';
import { StatCard } from '@/components/StatCard';
import {
  Wallet,
  Building,
  TrendingUp,
  ArrowDownRight,
  Plus,
  AlertCircle,
  X,
  Download,
  CheckCircle2,
  Receipt,
  UserCheck,
} from 'lucide-react';

export default function FinancePage() {
  const [summary, setSummary] = useState<FinanceSummary>(getFinanceSummary());
  const [settlements, setSettlements] = useState<Settlement[]>(getSettlementHistory());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Settlement Form State
  const [settleAmount, setSettleAmount] = useState<number>(1000);
  const [settleNotes, setSettleNotes] = useState<string>('تسليم نقدية السنتر اليومية للمدير');
  const [error, setError] = useState<string>('');

  const loadData = () => {
    setSummary(getFinanceSummary());
    setSettlements(getSettlementHistory());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!settleAmount || settleAmount <= 0) {
      setError('يرجى إدخال مبلغ تسليم صحيح أكبر من صفر');
      return;
    }

    try {
      recordSettlement({
        amount: Number(settleAmount),
        notes: settleNotes,
      });

      setIsModalOpen(false);
      setSettleAmount(1000);
      loadData();
      alert('تم تسجيل عملية تسليم النقدية للمدير بنجاح!');
    } catch (err: any) {
      setError(err.message || 'فشل تسليم النقدية');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>إدارة الماليات وتصفية الخزينة</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            الفصل بين خزينة السنتر ومحفظة المدير، وتسليم النقدية المجمعة
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => exportSettlementsToCSV(settlements)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            title="تصدير كشف التسليمات إلى Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>تسليم نقدية للمدير</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Grid (2 cols mobile, 4 cols desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title="إجمالي المقبوضات"
          value={formatCurrency(summary.total_collected)}
          subtitle="مجموع كل الدفعات المعتمدة"
          icon={Wallet}
          variant="blue"
        />

        <StatCard
          title="مستلم المدير المباشر"
          value={formatCurrency(summary.received_by_manager)}
          subtitle="محفظة وحسابات المدير"
          icon={TrendingUp}
          variant="purple"
        />

        <StatCard
          title="مقبوضات السنتر"
          value={formatCurrency(summary.received_by_center)}
          subtitle="إجمالي ما دخل خزينة السنتر"
          icon={Building}
          variant="emerald"
        />

        <StatCard
          title="المتبقي في الخزينة"
          value={formatCurrency(summary.remaining_with_center)}
          subtitle="مبالغ لم تسلم للمدير بعد"
          icon={AlertCircle}
          variant="amber"
          badge="نقدية الخزينة"
        />
      </div>

      {/* SETTLEMENTS HISTORY LOG (DUAL VIEW: MOBILE CARDS + DESKTOP TABLE) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
                سجل تسليم المبالغ للمدير ({settlements.length})
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                حركات تصفية نقدية خزينة السنتر ونقلها لمحفظة المدير
              </p>
            </div>
          </div>
        </div>

        {settlements.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400 text-xs font-semibold">
            لا توجد عمليات تسليم نقدية مسجلة بعد
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW */}
            <div className="block sm:hidden divide-y divide-slate-100">
              {settlements.map((s, idx) => (
                <div key={s.id} className="p-4 space-y-2.5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">#{s.id.slice(-6)}</span>
                      <p className="text-xs font-black text-slate-900 mt-0.5">
                        سجل بواسطة: <span className="text-blue-700">{s.delivered_by_name || s.delivered_by || 'السنتر'}</span>
                      </p>
                    </div>
                    <span className="text-base font-black text-emerald-600">
                      {formatCurrency(s.amount)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {s.notes || 'تسليم نقدية معتمد'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>الجهة: محفظة المدير المباشر</span>
                    <span>{formatDate(s.settlement_date)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden sm:block overflow-x-auto max-h-[550px] overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md text-slate-500 font-bold border-b border-slate-200/80 z-10 shadow-2xs">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">تاريخ التسليم</th>
                    <th className="p-4">المبلغ المسلم</th>
                    <th className="p-4">سجل بواسطة</th>
                    <th className="p-4">الجهة المستلمة</th>
                    <th className="p-4">ملاحظات وبيان التسليم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {settlements.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/90 transition-colors even:bg-slate-50/40 border-r-4 border-r-emerald-500">
                      <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-medium text-slate-600">{formatDate(s.settlement_date)}</td>
                      <td className="p-4 font-black text-emerald-600 text-sm">{formatCurrency(s.amount)}</td>
                      <td className="p-4 font-extrabold text-blue-700">{s.delivered_by_name || s.delivered_by || 'السنتر'}</td>
                      <td className="p-4 font-bold text-purple-700">محفظة / حساب المدير المباشر</td>
                      <td className="p-4 font-medium text-slate-600">{s.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* SETTLEMENT MODAL (RESPONSIVE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-slide-up duration-300">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>تسليم نقدية الخزينة للمدير</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSettlement} className="mt-4 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المراد تسليمه للمدير (EGP) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={settleAmount}
                  onChange={e => setSettleAmount(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                  المتبقي المتاح حالياً بالخزينة: {formatCurrency(summary.remaining_with_center)}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بيان وملاحظات التسليم</label>
                <textarea
                  rows={3}
                  value={settleNotes}
                  onChange={e => setSettleNotes(e.target.value)}
                  placeholder="اكتب تفاصيل التسليم أو التاريخ..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
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
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/25 active:scale-98"
                >
                  تأكيد تسليم النقدية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

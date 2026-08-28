'use client';

import React, { useState, useEffect } from 'react';
import { getFinanceSummary, getSettlementHistory, recordSettlement } from '@/services/finance-service';
import { FinanceSummary, Settlement } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatCard } from '@/components/StatCard';
import {
  Wallet,
  Building,
  TrendingUp,
  ArrowDownRight,
  Plus,
  Receipt,
  AlertCircle,
  X,
  CheckCircle2,
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
    } catch (err: any) {
      setError(err.message || 'فشل تسليم النقدية');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-600" />
            <span>إدارة الماليات والتسليمات (Manager Settlements)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            الفصل بين خزينة السنتر ومحفظة المدير، وتسليم النقدية المجمعة
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>تسليم نقدية للمدير (Settlement)</span>
        </button>
      </div>

      {/* Financial Summary Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="إجمالي المقبوضات الكلي"
          value={formatCurrency(summary.total_collected)}
          subtitle="مجموع كل الدفعات الصحيحة"
          icon={Wallet}
          variant="blue"
        />

        <StatCard
          title="مستلم بواسطة المدير المباشر"
          value={formatCurrency(summary.received_by_manager)}
          subtitle="محفظة وحساب المدير"
          icon={TrendingUp}
          variant="purple"
        />

        <StatCard
          title="مقبوضات السنتر / المساعدين"
          value={formatCurrency(summary.received_by_center)}
          subtitle="إجمالي ما تم استلامه بخزينة السنتر"
          icon={Building}
          variant="emerald"
        />

        <StatCard
          title="المتبقي حالياً في خزينة السنتر"
          value={formatCurrency(summary.remaining_with_center)}
          subtitle="المقبوضات مطروحاً منها ما تم تسليمه للمدير"
          icon={AlertCircle}
          variant="amber"
          badge="نقدية الخزينة"
        />
      </div>

      {/* SETTLEMENTS HISTORY LOG */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <ArrowDownRight className="w-5 h-5 text-emerald-600" />
            <span>سجل تسليم المبالغ للمدير ({settlements.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">تصفية العجز وتأكيد الاستلام</span>
        </div>

        <div className="overflow-x-auto">
          {settlements.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              لا توجد عمليات تسليم نقدية مسجلة بعد
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">المبلغ المسلّم</th>
                  <th className="p-4">تاريخ التسليم</th>
                  <th className="p-4">المسلّم (Delivered By)</th>
                  <th className="p-4">المستلم (Received By)</th>
                  <th className="p-4">ملاحظات والتفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {settlements.map((stl, idx) => (
                  <tr key={stl.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-4 font-black text-emerald-600 text-sm">
                      {formatCurrency(stl.amount)}
                    </td>
                    <td className="p-4 font-medium text-slate-600">{formatDate(stl.settlement_date)}</td>
                    <td className="p-4 font-bold text-slate-800">{stl.delivered_by_name}</td>
                    <td className="p-4 font-bold text-purple-700">{stl.received_by_name}</td>
                    <td className="p-4 text-slate-500">{stl.notes || 'تسليم عادي'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SETTLEMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                <span>تسليم نقدية من السنتر للمدير</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSettlement} className="mt-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold">
                  {error}
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block text-[11px]">النقدية المتاحة حالياً بالخزينة:</span>
                <span className="text-lg font-black text-amber-600">
                  {formatCurrency(summary.remaining_with_center)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المسلّم فعلياً (EGP) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={settleAmount}
                  onChange={e => setSettleAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-base font-black text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات التسليم</label>
                <input
                  type="text"
                  value={settleNotes}
                  onChange={e => setSettleNotes(e.target.value)}
                  placeholder="مثال: تسليم نقدية الأسبوع الأول"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
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
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                >
                  تأكيد تسليم المبلغ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

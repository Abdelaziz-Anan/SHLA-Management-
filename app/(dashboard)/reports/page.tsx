'use client';

import React, { useState, useEffect } from 'react';
import { getFinanceSummary } from '@/services/finance-service';
import { getOutstandingDebtorsReport, getGroupRevenueReport, exportToCSV } from '@/services/report-service';
import { store } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  Users2,
  AlertCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'monthly' | 'groups' | 'debtors'>('monthly');
  const [financeSummary, setFinanceSummary] = useState(getFinanceSummary());
  const [groupReports, setGroupReports] = useState<any[]>([]);
  const [debtors, setDebtors] = useState<any[]>([]);
  const [centerInfo, setCenterInfo] = useState(store.getCenter());

  useEffect(() => {
    setFinanceSummary(getFinanceSummary());
    setGroupReports(getGroupRevenueReport());
    setDebtors(getOutstandingDebtorsReport());
    setCenterInfo(store.getCenter());
  }, []);

  const chartData = groupReports.map(gr => ({
    name: `مجموعة #${gr.group.group_number}`,
    collected: gr.total_collected,
    outstanding: gr.total_outstanding,
  }));

  const handleExportCSV = () => {
    if (activeTab === 'debtors') {
      const rows = debtors.map(d => ({
        'اسم الطالب': d.student?.full_name,
        'الهاتف': d.student?.phone,
        'المجموعة': `مجموعة #${d.group?.group_number}`,
        'سعر الكورس': d.course_price,
        'المدفوع': d.total_paid,
        'المتبقي': d.remaining_balance,
        'وسيلة الحجز': d.booking_method,
      }));
      exportToCSV('outstanding_debtors_report', rows);
    } else if (activeTab === 'groups') {
      const rows = groupReports.map(g => ({
        'رقم المجموعة': g.group.group_number,
        'اسم الكورس': g.group.course_name,
        'المحاضر': g.group.trainer_name,
        'عدد الطلاب': g.student_count,
        'الإيراد المحصل': g.total_collected,
        'المتبقي المطلوب': g.total_outstanding,
      }));
      exportToCSV('group_revenue_report', rows);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print-only p-6 border-b border-slate-300 text-center">
        <h1 className="text-2xl font-black">{centerInfo.name}</h1>
        <p className="text-sm text-slate-600">تقرير الإيرادات والمستحقات المعتمد - {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      {/* Screen Title & Buttons */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-purple-600" />
            <span>التقارير المالية والتحليلات</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            تقارير الإيرادات الشهرية، إيراد المجموعات، ومستحقات الديون المتبقية
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel / CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة PDF التقرير</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="no-print flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'monthly'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ملخص الإيرادات والتحليلات
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'groups'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          تقرير إيرادات المجموعات ({groupReports.length})
        </button>

        <button
          onClick={() => setActiveTab('debtors')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'debtors'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          تقرير الديون المستحقة على الطلاب ({debtors.length})
        </button>
      </div>

      {/* TAB 1: MONTHLY & ANALYTICS */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>مقارنة المقبوضات مقابل المستحقات المتبقية لكل مجموعة</span>
            </h2>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="collected" name="المتحصل الفعلي" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="outstanding" name="المتبقي المستحق" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GROUPS BREAKDOWN */}
      {activeTab === 'groups' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">رقم المجموعة</th>
                  <th className="p-4">اسم الكورس</th>
                  <th className="p-4">المحاضر</th>
                  <th className="p-4">عدد الطلاب</th>
                  <th className="p-4">الإيراد المحصل</th>
                  <th className="p-4">المستحق المتبقي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {groupReports.map(g => (
                  <tr key={g.group.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-blue-700">مجموعة #{g.group.group_number}</td>
                    <td className="p-4 font-extrabold text-slate-900">{g.group.course_name}</td>
                    <td className="p-4 font-medium text-slate-700">{g.group.trainer_name}</td>
                    <td className="p-4 font-bold text-slate-800">{g.student_count} طالب</td>
                    <td className="p-4 font-extrabold text-emerald-600">{formatCurrency(g.total_collected)}</td>
                    <td className="p-4 font-extrabold text-rose-600">{formatCurrency(g.total_outstanding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OUTSTANDING DEBTORS */}
      {activeTab === 'debtors' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>قائمة الطلاب المتأخرين في السداد (مرتبة حسب أعلى مبلغ متبقي)</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            {debtors.length === 0 ? (
              <div className="p-12 text-center text-emerald-600 font-bold text-sm">
                لا يوجد طلاب عليهم مستحقات مالية متاخرة!
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">اسم الطالب</th>
                    <th className="p-4">رقم الهاتف</th>
                    <th className="p-4">المجموعة</th>
                    <th className="p-4">سعر الكورس</th>
                    <th className="p-4">المدفوع</th>
                    <th className="p-4">المتبقي المطلوب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {debtors.map((d, idx) => (
                    <tr key={d.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-extrabold text-slate-900">{d.student?.full_name}</td>
                      <td className="p-4 font-semibold text-slate-600" dir="ltr">{d.student?.phone}</td>
                      <td className="p-4 font-bold text-blue-700">مجموعة #{d.group?.group_number}</td>
                      <td className="p-4 font-semibold text-slate-800">{formatCurrency(d.course_price)}</td>
                      <td className="p-4 font-bold text-emerald-600">{formatCurrency(d.total_paid || 0)}</td>
                      <td className="p-4 font-black text-rose-600 text-sm">{formatCurrency(d.remaining_balance || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getFinanceSummary } from '@/services/finance-service';
import { getOutstandingDebtorsReport, getGroupRevenueReport } from '@/services/report-service';
import { exportToCSV } from '@/lib/export-utils';
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
  Wallet,
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
    name: `#${gr.group.group_number}`,
    fullName: `مجموعة #${gr.group.group_number}`,
    collected: gr.total_collected,
    outstanding: gr.total_outstanding,
  }));

  const handleExportCSV = () => {
    if (activeTab === 'debtors') {
      const rows = debtors.map((d, idx) => ({
        '#': idx + 1,
        'اسم الطالب': d.student?.full_name,
        'الهاتف': d.student?.phone,
        'المجموعة': `مجموعة #${d.group?.group_number}`,
        'سعر الكورس (ج.م)': d.course_price,
        'المدفوع (ج.م)': d.total_paid,
        'المتبقي (ج.م)': d.remaining_balance,
        'وسيلة الحجز': d.booking_method,
      }));
      exportToCSV('SHLA_تقرير_الديون_والمستحقات', rows);
    } else if (activeTab === 'groups') {
      const rows = groupReports.map((g, idx) => ({
        '#': idx + 1,
        'رقم المجموعة': g.group.group_number,
        'اسم الكورس': g.group.course_name,
        'المحاضر': g.group.trainer_name,
        'عدد الطلاب': g.student_count,
        'الإيراد المتوقع (ج.م)': g.expected_total,
        'المحصل الفعلي (ج.م)': g.total_collected,
        'المتبقي المطلوب (ج.م)': g.total_outstanding,
      }));
      exportToCSV('SHLA_تقرير_إيرادات_المجموعات', rows);
    } else {
      const rows = [
        {
          'البند المالي': 'إجمالي المقبوضات المعتمدة',
          'القيمة (ج.م)': financeSummary.total_collected,
          'البيان': 'مجموع كافة الدفعات الصحيحة',
        },
        {
          'البند المالي': 'مستلم بواسطة المدير المباشر',
          'القيمة (ج.م)': financeSummary.received_by_manager,
          'البيان': 'محفظة وحسابات المدير',
        },
        {
          'البند المالي': 'مقبوضات السنتر',
          'القيمة (ج.م)': financeSummary.received_by_center,
          'البيان': 'إجمالي ما استلمته خزينة السنتر',
        },
        {
          'البند المالي': 'المتبقي حالياً بخزينة السنتر',
          'القيمة (ج.م)': financeSummary.remaining_with_center,
          'البيان': 'نقدية بانتظار التسليم للمدير',
        },
        {
          'البند المالي': 'إجمالي الديون المتبقية على الطلاب',
          'القيمة (ج.م)': financeSummary.total_outstanding_students,
          'البيان': 'مجموع المستحقات غير المسددة',
        },
      ];
      exportToCSV('SHLA_تقرير_الملخص_المالي', rows);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print-only p-6 border-b border-slate-300 text-center">
        <h1 className="text-2xl font-black">{centerInfo.name}</h1>
        <p className="text-sm text-slate-600">تقرير الإيرادات والمستحقات المعتمد - {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      {/* Screen Title & Buttons */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>التقارير المالية والتحليلات</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تقارير الإيرادات، كشف الديون المستحقة، ومقارنة أداء المجموعات
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel / CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة PDF</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Scrollable on Mobile) */}
      <div className="no-print flex border-b border-slate-200 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'monthly'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ملخص الإيرادات والتحليلات
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'groups'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          إيرادات المجموعات ({groupReports.length})
        </button>

        <button
          onClick={() => setActiveTab('debtors')}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'debtors'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          الديون والمستحقات ({debtors.length})
        </button>
      </div>

      {/* TAB 1: MONTHLY & ANALYTICS */}
      {activeTab === 'monthly' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          {/* Chart Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-xs">
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>مقارنة المحصل مقابل المتبقي لكل مجموعة (EGP)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              الأعمدة الخضراء تعبر عن المبالغ المحصلة فعلياً، والأعمدة الحمراء تعبر عن الديون المتبقية
            </p>

            <div className="h-64 sm:h-80 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  />
                  <Bar dataKey="collected" name="المحصل" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="outstanding" name="المتبقي" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GROUPS REVENUE */}
      {activeTab === 'groups' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden animate-in fade-in duration-200">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md text-slate-500 font-bold border-b border-slate-200/80 z-10 shadow-2xs">
                <tr>
                  <th className="p-4">المجموعة</th>
                  <th className="p-4">الكورس والمحاضر</th>
                  <th className="p-4">عدد الطلاب</th>
                  <th className="p-4">الإيراد المتوقع</th>
                  <th className="p-4">المحصل الفعلي</th>
                  <th className="p-4">المتبقي المطلوب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {groupReports.map(g => (
                  <tr key={g.group.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-black text-blue-700">مجموعة #{g.group.group_number}</td>
                    <td className="p-4 font-bold text-slate-900">{g.group.course_name} - {g.group.trainer_name}</td>
                    <td className="p-4 font-bold text-slate-600">{g.student_count} طلاب</td>
                    <td className="p-4 font-bold text-slate-700">{formatCurrency(g.expected_total)}</td>
                    <td className="p-4 font-black text-emerald-600">{formatCurrency(g.total_collected)}</td>
                    <td className="p-4 font-black text-rose-600">{formatCurrency(g.total_outstanding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEBTORS */}
      {activeTab === 'debtors' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden animate-in fade-in duration-200">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md text-slate-500 font-bold border-b border-slate-200/80 z-10 shadow-2xs">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">اسم الطالب</th>
                  <th className="p-4">الهاتف</th>
                  <th className="p-4">المجموعة</th>
                  <th className="p-4">سعر الكورس</th>
                  <th className="p-4">المسدد</th>
                  <th className="p-4">المتبقي المطلوب</th>
                  <th className="p-4">طريقة الحجز</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {debtors.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/90 transition-colors even:bg-slate-50/40 border-r-4 border-r-rose-500">
                    <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-4 font-black text-slate-900">{d.student?.full_name}</td>
                    <td className="p-4 font-semibold text-slate-600" dir="ltr">{d.student?.phone}</td>
                    <td className="p-4 font-bold text-blue-700">مجموعة #{d.group?.group_number}</td>
                    <td className="p-4 font-bold text-slate-700">{formatCurrency(d.course_price)}</td>
                    <td className="p-4 font-bold text-emerald-600">{formatCurrency(d.total_paid || 0)}</td>
                    <td className="p-4 font-black text-rose-600 text-sm">{formatCurrency(d.remaining_balance || 0)}</td>
                    <td className="p-4 font-medium text-slate-600">{d.booking_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

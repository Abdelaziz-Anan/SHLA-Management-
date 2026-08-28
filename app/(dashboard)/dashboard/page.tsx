'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFinanceSummary } from '@/services/finance-service';
import { getGroups } from '@/services/group-service';
import { getGroupStudentsWithDetails } from '@/services/student-service';
import { store } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useLanguage } from '@/lib/language-context';
import {
  Users2,
  GraduationCap,
  Wallet,
  Building,
  AlertCircle,
  Plus,
  CreditCard,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [summary, setSummary] = useState(getFinanceSummary());
  const [groups, setGroups] = useState(getGroups());
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    setSummary(getFinanceSummary());
    setGroups(getGroups());
    const validPayments = store.getPayments().filter(p => p.status === 'valid').slice(0, 5);
    const groupStudents = getGroupStudentsWithDetails();
    
    const enriched = validPayments.map(p => {
      const gs = groupStudents.find(g => g.id === p.group_student_id);
      return { ...p, groupStudent: gs };
    });
    setRecentPayments(enriched);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="/logo.jpeg"
              alt="SHLA Logo"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-xl hidden sm:block"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                SHLA Management
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                {t(
                  'ملخص المجموعات، الطلاب، حركة الخزينة، والمبالغ المستحقة بلمسة واحدة.',
                  'Groups summary, students directory, treasury flow, and outstanding debt at your fingertips.'
                )}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/groups?action=new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('مجموعة جديدة', 'New Group')}</span>
            </Link>
            <Link
              href="/students?action=new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{t('إضافة طالب', 'Add Student')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title={t('إجمالي المقبوضات', 'Total Collected')}
          value={formatCurrency(summary.total_collected)}
          subtitle={t(`${summary.payment_count} عملية تحصيل معتمدة`, `${summary.payment_count} verified payments`)}
          icon={Wallet}
          variant="blue"
        />

        <StatCard
          title={t('مستلم بواسطة المدير', 'Received by Manager')}
          value={formatCurrency(summary.received_by_manager)}
          subtitle={t('محفظة / حسابات المدير المباشرة', 'Direct Manager Wallet & Accounts')}
          icon={TrendingUp}
          variant="purple"
        />

        <StatCard
          title={t('المتبقي في السنتر / المساعدين', 'Remaining with Center')}
          value={formatCurrency(summary.remaining_with_center)}
          subtitle={t('مبالغ تم جمعها ولم تسلم للمدير بعد', 'Collected cash awaiting manager settlement')}
          icon={Building}
          variant="emerald"
        />

        <StatCard
          title={t('مستحقات طلاب متبقية', 'Outstanding Student Debt')}
          value={formatCurrency(summary.total_outstanding_students)}
          subtitle={t('مجموع المبالغ المتبقية على الطلاب', 'Total remaining balance owed by students')}
          icon={AlertCircle}
          variant="rose"
        />
      </div>

      {/* Secondary Quick Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Groups Overview */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users2 className="w-6 h-6" />
            </div>
            <Link href="/groups" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <span>{t('عرض الكل', 'View All')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900">{summary.group_count}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t('إجمالي المجموعات الدراسية النشطة', 'Total Active Groups')}
            </p>
          </div>
        </div>

        {/* Total Students Overview */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <Link href="/students" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
              <span>{t('عرض الكل', 'View All')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900">{summary.student_count}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t('إجمالي الطلاب المسجلين بالسنتر', 'Total Enrolled Students')}
            </p>
          </div>
        </div>

        {/* Reports Shortcut Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <Link href="/reports" className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1">
              <span>{t('التقارير', 'Reports')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900">
              {t('تقارير الإيرادات والمستحقات', 'Revenue & Debt Reports')}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t('تصدير تقارير PDF و CSV بنقرة واحدة', 'Export PDF and CSV reports in one click')}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-900">
              {t('أحدث المدفوعات المسجلة', 'Recent Registered Payments')}
            </h2>
          </div>
          <Link href="/payments" className="text-xs font-semibold text-blue-600 hover:underline">
            {t('عرض كل المدفوعات', 'View All Payments')}
          </Link>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              {t('لا توجد مدفوعات مسجلة حديثاً', 'No recent payments found')}
            </div>
          ) : (
            recentPayments.map(pay => (
              <div key={pay.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    +
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {pay.groupStudent?.student?.full_name || t('طالب', 'Student')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t('مجموعة', 'Group')} #{pay.groupStudent?.group?.group_number || '-'} • {pay.payment_method}
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <p className="text-sm font-extrabold text-emerald-600">
                    +{formatCurrency(pay.amount)}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">{pay.payment_date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

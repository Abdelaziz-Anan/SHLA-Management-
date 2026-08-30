'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getFinanceSummary } from '@/services/finance-service';
import { getGroups } from '@/services/group-service';
import { getGroupStudentsWithDetails } from '@/services/student-service';
import { store } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatCard } from '@/components/StatCard';
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
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [summary, setSummary] = useState(getFinanceSummary());
  const [groups, setGroups] = useState(getGroups());
  const [payments, setPayments] = useState<any[]>([]);
  const [coverUrl, setCoverUrl] = useState<string>('/cover.jpeg');

  useEffect(() => {
    setSummary(getFinanceSummary());
    setGroups(getGroups());
    const center = store.getCenter();
    setCoverUrl(center.cover_url || '/cover.jpeg');
    setPayments(store.getPayments());
  }, []);

  // Memoize recent enriched payments to optimize performance
  const recentPayments = useMemo(() => {
    const validPayments = payments.filter(p => p.status === 'valid').slice(0, 6);
    const groupStudents = getGroupStudentsWithDetails();

    return validPayments.map(p => {
      const gs = groupStudents.find(g => g.id === p.group_student_id);
      return { ...p, groupStudent: gs };
    });
  }, [payments]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Responsive Academy Hero Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-850 bg-slate-950 group">
        {/* Cover Background Image */}
        <div className="w-full min-h-[360px] sm:min-h-[290px] lg:h-80 relative flex flex-col justify-end">
          <img
            src={coverUrl}
            alt="SHLA Academy Cover Banner"
            className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out opacity-60 sm:opacity-75"
          />
          {/* Deep gradient overlay to ensure 100% text readability on any device */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 sm:via-slate-950/40 to-slate-950/20" />

          {/* Controls & Info Container */}
          <div className="relative z-10 p-4 sm:p-7 lg:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* Academy Title & Badge */}
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <img
                src="/logo.jpeg"
                alt="SHLA Logo"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/30 shadow-2xl backdrop-blur-md bg-slate-900/60 flex-shrink-0"
              />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] sm:text-xs font-bold mb-1 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Samar Hamdy Language Academy</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  SHLA Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl drop-shadow-sm mt-0.5 line-clamp-2 sm:line-clamp-none">
                  {t(
                    'ملخص المجموعات، الطلاب، حركة الخزينة، والمبالغ المستحقة بلمسة واحدة.',
                    'Groups summary, students directory, treasury flow, and outstanding debt at your fingertips.'
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons Stacked Vertically (مجموعة جديدة فوق إضافة طالب) */}
            <div className="flex flex-col gap-2 sm:min-w-[170px] w-full sm:w-auto pt-2 sm:pt-0">
              {/* Top Button: مجموعة جديدة */}
              <Link
                href="/groups?action=new"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all border border-blue-400/30 active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>{t('مجموعة جديدة', 'New Group')}</span>
              </Link>

              {/* Bottom Button: إضافة طالب */}
              <Link
                href="/students?action=new"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-xs border border-slate-700/80 backdrop-blur-md transition-all active:scale-98 shadow-sm"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{t('إضافة طالب', 'Add Student')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid (2 columns on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title={t('إجمالي المقبوضات', 'Total Collected')}
          value={formatCurrency(summary.total_collected)}
          subtitle={t(`${summary.payment_count} عملية معتمدة`, `${summary.payment_count} verified`)}
          icon={Wallet}
          variant="blue"
          className="animate-slide-up stagger-1"
        />

        <StatCard
          title={t('مستلم المدير', 'Manager Wallet')}
          value={formatCurrency(summary.received_by_manager)}
          subtitle={t('محفظة وحسابات المدير', 'Direct Manager Wallet')}
          icon={TrendingUp}
          variant="purple"
          className="animate-slide-up stagger-2"
        />

        <StatCard
          title={t('خزينة السنتر', 'Center Cash')}
          value={formatCurrency(summary.remaining_with_center)}
          subtitle={t('متبقي لم يسلم للمدير', 'Awaiting Settlement')}
          icon={Building}
          variant="emerald"
          className="animate-slide-up stagger-3"
        />

        <StatCard
          title={t('مستحقات الطلاب', 'Student Debt')}
          value={formatCurrency(summary.total_outstanding_students)}
          subtitle={t('متبقي على الطلاب', 'Owed by students')}
          icon={AlertCircle}
          variant="rose"
          className="animate-slide-up stagger-4"
        />
      </div>

      {/* Secondary Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Active Groups Overview */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover-lift shine-sweep group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/60 group-hover:shadow-glow-blue transition-shadow duration-300">
              <Users2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <Link href="/groups" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <span>{t('عرض الكل', 'View All')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">{summary.group_count}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {t('إجمالي المجموعات الدراسية النشطة', 'Total Active Groups')}
            </p>
          </div>
        </div>

        {/* Total Students Overview */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover-lift shine-sweep group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/60 group-hover:shadow-glow-emerald transition-shadow duration-300">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <Link href="/students" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              <span>{t('عرض الكل', 'View All')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">{summary.student_count}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {t('إجمالي الطلاب المسجلين بالسنتر', 'Total Enrolled Students')}
            </p>
          </div>
        </div>

        {/* Reports Shortcut Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover-lift shine-sweep group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100/60 group-hover:shadow-glow-purple transition-shadow duration-300">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <Link href="/reports" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
              <span>{t('التقارير', 'Reports')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900">
              {t('تقارير الإيرادات والمستحقات', 'Revenue & Debt Reports')}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t('تصدير تقارير Excel و PDF بنقرة واحدة', 'Export Excel and PDF reports in one click')}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
              {t('أحدث المدفوعات المسجلة', 'Recent Registered Payments')}
            </h2>
          </div>
          <Link href="/payments" className="text-xs font-bold text-blue-600 hover:underline">
            {t('عرض كل المدفوعات', 'View All')}
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              {t('لا توجد مدفوعات مسجلة حديثاً', 'No recent payments found')}
            </div>
          ) : (
            recentPayments.map(pay => (
              <div key={pay.id} className="p-3.5 sm:px-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden pr-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center flex-shrink-0 border border-emerald-100">
                    +
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {pay.groupStudent?.student?.full_name || t('طالب', 'Student')}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {t('مجموعة', 'Group')} #{pay.groupStudent?.group?.group_number || '-'} • {pay.payment_method}
                    </p>
                  </div>
                </div>

                <div className="text-left flex-shrink-0 pl-1">
                  <p className="text-xs sm:text-sm font-black text-emerald-600">
                    +{formatCurrency(pay.amount)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-semibold">{formatDate(pay.payment_date)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

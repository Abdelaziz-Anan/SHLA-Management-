'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/types';
import { useLanguage } from '@/lib/language-context';
import {
  LayoutDashboard,
  Users2,
  GraduationCap,
  CreditCard,
  Wallet,
  FileSpreadsheet,
  UserCheck,
  Settings,
  ShieldCheck,
  LogOut,
  Globe,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { logoutUser } from '@/services/auth-service';
import { StatusBadge } from './StatusBadge';

interface SidebarProps {
  user: UserProfile | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { lang, toggleLang, t } = useLanguage();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isManager = user?.role === 'manager';

  const navItems = [
    { label: t('الرئيسية', 'Dashboard'), href: '/dashboard', icon: LayoutDashboard, managerOnly: false },
    { label: t('المجموعات', 'Groups'), href: '/groups', icon: Users2, managerOnly: false },
    { label: t('الطلاب', 'Students'), href: '/students', icon: GraduationCap, managerOnly: false },
    { label: t('المدفوعات', 'Payments'), href: '/payments', icon: CreditCard, managerOnly: false },
    { label: t('إدارة الماليات', 'Finance'), href: '/finance', icon: Wallet, managerOnly: false },
    { label: t('التقارير المالية', 'Reports'), href: '/reports', icon: FileSpreadsheet, managerOnly: false },
    { label: t('إدارة المستخدمين', 'Users Management'), href: '/users', icon: UserCheck, managerOnly: true },
    { label: t('إعدادات الهوية', 'Branding Settings'), href: '/settings', icon: Settings, managerOnly: true },
    { label: t('سجل العمليات', 'Audit Log'), href: '/audit-log', icon: ShieldCheck, managerOnly: true },
  ];

  const filteredItems = navItems.filter(item => !item.managerOnly || isManager);

  // Top 4 items for quick mobile bottom bar
  const mobilePrimaryItems = [
    { label: t('الرئيسية', 'Home'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('المجموعات', 'Groups'), href: '/groups', icon: Users2 },
    { label: t('الطلاب', 'Students'), href: '/students', icon: GraduationCap },
    { label: t('المدفوعات', 'Payments'), href: '/payments', icon: CreditCard },
  ];

  const isMoreActive =
    pathname.startsWith('/finance') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/audit-log');

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 text-slate-100 border-l border-slate-800/80 min-h-screen sticky top-0 shadow-2xl z-20">
        {/* Branding Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="SHLA Logo"
            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-md flex-shrink-0"
          />
          <div className="overflow-hidden">
            <h2 className="font-extrabold text-sm tracking-wide text-white truncate">SHLA Management</h2>
            <p className="text-[11px] text-slate-400 truncate">Samar Hamdy Academy</p>
          </div>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="p-3.5 mx-3 my-3 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="overflow-hidden pr-1">
                <p className="text-xs font-bold text-slate-100 truncate">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <StatusBadge status={user.role} type="user" />
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('متصل', 'Online')}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {filteredItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-bold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Language Switcher & Logout Button */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={toggleLang}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-850 hover:text-white transition-colors border border-slate-800"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{lang === 'ar' ? '🌐 Switch to English' : '🌐 التبديل إلى العربية'}</span>
          </button>

          <button
            onClick={() => {
              logoutUser();
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('تسجيل الخروج', 'Log Out')}</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR (FIXED DOCK) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-bottom">
        {mobilePrimaryItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all min-w-[56px]',
                isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-blue-400' : 'text-slate-400')} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* 5th Button: MORE (المزيد) opens full mobile drawer */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all min-w-[56px]',
            isMoreActive || mobileDrawerOpen
              ? 'text-purple-400 bg-purple-500/10'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Menu className="w-4 h-4" />
          <span>{t('المزيد', 'More')}</span>
        </button>
      </nav>

      {/* MOBILE EXPANDED DRAWER / BOTTOM SHEET */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="flex-1"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl safe-bottom animate-in slide-in-from-bottom duration-300">
            {/* Drawer Handle & Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpeg"
                  alt="SHLA Logo"
                  className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h3 className="font-black text-sm text-white">SHLA Management</h3>
                  <p className="text-[11px] text-slate-400">{user?.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Details Box */}
            {user && (
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">{user.email}</p>
                  <p className="text-[10px] text-slate-400" dir="ltr">{user.phone || 'No phone'}</p>
                </div>
                <StatusBadge status={user.role} type="user" />
              </div>
            )}

            {/* Menu Links */}
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-2">
                {t('كافة الأقسام والخدمات', 'All Sections & Services')}
              </p>
              {filteredItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all',
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 opacity-50" />
                  </Link>
                );
              })}
            </div>

            {/* Drawer Footer: Language Toggle & Logout */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  toggleLang();
                  setMobileDrawerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span>{lang === 'ar' ? '🌐 Switch to English' : '🌐 التبديل إلى العربية'}</span>
              </button>

              <button
                onClick={() => {
                  logoutUser();
                  window.location.href = '/login';
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 text-rose-400 text-xs font-bold rounded-2xl border border-rose-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('تسجيل الخروج', 'Log Out')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

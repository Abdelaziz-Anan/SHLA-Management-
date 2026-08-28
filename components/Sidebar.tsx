'use client';

import React from 'react';
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
} from 'lucide-react';
import { logoutUser } from '@/services/auth-service';
import { StatusBadge } from './StatusBadge';

interface SidebarProps {
  user: UserProfile | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { lang, toggleLang, t } = useLanguage();
  const isManager = user?.role === 'manager';

  const navItems = [
    { label: t('الرئيسية', 'Dashboard'), href: '/dashboard', icon: LayoutDashboard, managerOnly: false },
    { label: t('المجموعات', 'Groups'), href: '/groups', icon: Users2, managerOnly: false },
    { label: t('الطلاب', 'Students'), href: '/students', icon: GraduationCap, managerOnly: false },
    { label: t('المدفوعات والإيصالات', 'Payments & Receipts'), href: '/payments', icon: CreditCard, managerOnly: false },
    { label: t('إدارة الماليات', 'Finance'), href: '/finance', icon: Wallet, managerOnly: false },
    { label: t('التقارير المالية', 'Reports'), href: '/reports', icon: FileSpreadsheet, managerOnly: false },
    { label: t('إدارة المستخدمين', 'Users Management'), href: '/users', icon: UserCheck, managerOnly: true },
    { label: t('إعدادات الهوية', 'Branding Settings'), href: '/settings', icon: Settings, managerOnly: true },
    { label: t('سجل العمليات', 'Audit Log'), href: '/audit-log', icon: ShieldCheck, managerOnly: true },
  ];

  const filteredItems = navItems.filter(item => !item.managerOnly || isManager);

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-100 border-l border-slate-800 min-h-screen sticky top-0 shadow-xl">
        {/* Branding Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="SHLA Logo"
            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-md"
          />
          <div>
            <h2 className="font-bold text-base tracking-wide text-white">SHLA Management</h2>
            <p className="text-xs text-slate-400">Samar Hamdy Language Academy</p>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-100 truncate">{user.full_name}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <StatusBadge status={user.role} type="user" />
              <span className="text-[10px] text-emerald-400 font-medium">{t('متصل الآن', 'Online')}</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {filteredItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Language Switcher & Logout Button */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={toggleLang}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{lang === 'ar' ? '🌐 Switch to English' : '🌐 التبديل إلى العربية'}</span>
          </button>

          <button
            onClick={() => {
              logoutUser();
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('تسجيل الخروج', 'Log Out')}</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        {filteredItems.slice(0, 5).map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-medium transition-all',
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

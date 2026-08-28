'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/types';
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
  Building2,
} from 'lucide-react';
import { logoutUser } from '@/services/auth-service';
import { StatusBadge } from './StatusBadge';

interface SidebarProps {
  user: UserProfile | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isManager = user?.role === 'manager';

  const navItems = [
    { label: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard, managerOnly: false },
    { label: 'المجموعات', href: '/groups', icon: Users2, managerOnly: false },
    { label: 'الطلاب', href: '/students', icon: GraduationCap, managerOnly: false },
    { label: 'المدفوعات والإيصالات', href: '/payments', icon: CreditCard, managerOnly: false },
    { label: 'إدارة الماليات', href: '/finance', icon: Wallet, managerOnly: false },
    { label: 'التقارير المالية', href: '/reports', icon: FileSpreadsheet, managerOnly: false },
    { label: 'إدارة المستخدمين', href: '/users', icon: UserCheck, managerOnly: true },
    { label: 'إعدادات الهوية', href: '/settings', icon: Settings, managerOnly: true },
    { label: 'سجل العمليات', href: '/audit-log', icon: ShieldCheck, managerOnly: true },
  ];

  const filteredItems = navItems.filter(item => !item.managerOnly || isManager);

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-100 border-l border-slate-800 min-h-screen sticky top-0 shadow-xl">
        {/* Branding Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-wide text-white">English Center</h2>
            <p className="text-xs text-slate-400">نظام إدارة السنتر</p>
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
              <span className="text-[10px] text-emerald-400 font-medium">متصل الان</span>
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

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logoutUser();
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR (TOUCH FRIENDLY) */}
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

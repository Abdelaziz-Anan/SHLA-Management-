'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types';
import { StatusBadge } from './StatusBadge';
import { logoutUser } from '@/services/auth-service';
import { useLanguage } from '@/lib/language-context';
import { LogOut, Menu, X, Globe } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  user: UserProfile | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggleLang, t } = useLanguage();
  const isManager = user?.role === 'manager';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Mobile Menu Toggle + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpeg"
              alt="SHLA Logo"
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              SHLA Management
            </h1>
          </div>
        </div>

        {/* Right Controls: Language Switcher & User Info */}
        <div className="flex items-center gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-800">{user.full_name}</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
              <StatusBadge status={user.role} type="user" />
              <button
                onClick={() => {
                  logoutUser();
                  window.location.href = '/login';
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                title={t('تسجيل الخروج', 'Log Out')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('خروج', 'Exit')}</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('تسجيل الدخول', 'Log In')}
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 text-slate-100 px-4 py-4 border-b border-slate-800 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="p-3 bg-slate-800 rounded-xl mb-3">
            <p className="font-semibold text-sm">{user?.full_name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <div className="mt-2">
              <StatusBadge status={user?.role || 'assistant'} type="user" />
            </div>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800"
          >
            {t('الرئيسية', 'Dashboard')}
          </Link>
          <Link
            href="/groups"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800"
          >
            {t('المجموعات', 'Groups')}
          </Link>
          <Link
            href="/students"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800"
          >
            {t('الطلاب', 'Students')}
          </Link>
          <Link
            href="/payments"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800"
          >
            {t('المدفوعات والإيصالات', 'Payments')}
          </Link>
          <Link
            href="/finance"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800"
          >
            {t('إدارة الماليات', 'Finance')}
          </Link>
          <Link
            href="/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-800"
          >
            {t('التقارير المالية', 'Reports')}
          </Link>
          {isManager && (
            <>
              <hr className="border-slate-800 my-2" />
              <Link
                href="/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-purple-400 hover:bg-slate-800"
              >
                {t('إدارة المستخدمين', 'User Management')}
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-purple-400 hover:bg-slate-800"
              >
                {t('إعدادات الهوية', 'Branding Settings')}
              </Link>
              <Link
                href="/audit-log"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-purple-400 hover:bg-slate-800"
              >
                {t('سجل العمليات', 'Audit Logs')}
              </Link>
            </>
          )}
          <button
            onClick={() => {
              logoutUser();
              window.location.href = '/login';
            }}
            className="w-full text-right px-3 py-2 rounded-lg text-sm text-rose-400 font-semibold hover:bg-rose-950/30"
          >
            {t('تسجيل الخروج', 'Log Out')}
          </button>
        </div>
      )}
    </header>
  );
}

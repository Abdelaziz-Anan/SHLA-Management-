'use client';

import React from 'react';
import { UserProfile } from '@/types';
import { StatusBadge } from './StatusBadge';
import { logoutUser } from '@/services/auth-service';
import { useLanguage } from '@/lib/language-context';
import { LogOut, Globe } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  user: UserProfile | null;
}

export function Navbar({ user }: NavbarProps) {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Center Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpeg"
              alt="SHLA Logo"
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
            />
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                SHLA Management
              </h1>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block mt-0.5">
                Samar Hamdy Language Academy
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: Language Switcher & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5"
            title="تبديل لغة الواجهة"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px]">{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{user.full_name}</span>
                <span className="text-[10px] text-slate-500 line-clamp-1">{user.email}</span>
              </div>
              <StatusBadge status={user.role} type="user" />
              <button
                onClick={() => {
                  logoutUser();
                  window.location.href = '/login';
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200/60"
                title={t('تسجيل الخروج', 'Log Out')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('خروج', 'Exit')}</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
            >
              {t('تسجيل الدخول', 'Log In')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

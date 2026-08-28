'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithCredentials } from '@/services/auth-service';
import { Building2, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('manager@center.com');
  const [password, setPassword] = useState('manager123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithCredentials(emailOrPhone, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleEmail: string) => {
    setEmailOrPhone(roleEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-600/30 border border-blue-400/20">
            <Building2 className="w-10 h-10" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
            English Center
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            نظام إدارة السنتر الرقمي الاحترافي
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/60">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  اسم المستخدم / البريد / الهاتف
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="مثال: manager@center.com"
                    className="block w-full pr-10 pl-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  كلمة المرور
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pr-10 pl-10 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'جاري التحقق والتسجيل...' : 'تسجيل الدخول إلى النظام'}
                </button>
              </div>
            </form>

            {/* Quick Demo Selectors */}
            <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
              <p className="text-xs text-slate-400 mb-3 font-semibold">اختصارات الدخول السريع (الدعم الأولي):</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('manager@center.com')}
                  className="px-2.5 py-2 bg-slate-900/80 hover:bg-purple-950/40 text-purple-300 border border-purple-800/40 rounded-xl text-xs font-semibold transition-colors"
                >
                  المدير Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('assistant1@center.com')}
                  className="px-2.5 py-2 bg-slate-900/80 hover:bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 rounded-xl text-xs font-semibold transition-colors"
                >
                  مساعد 1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('assistant2@center.com')}
                  className="px-2.5 py-2 bg-slate-900/80 hover:bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 rounded-xl text-xs font-semibold transition-colors"
                >
                  مساعد 2
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

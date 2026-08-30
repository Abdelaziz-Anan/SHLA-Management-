'use client';

import React, { useState, useEffect } from 'react';
import { getCenterBranding, updateCenterBranding } from '@/services/settings-service';
import { CenterInfo } from '@/types';
import { Settings, Building2, CheckCircle2, FileImage, Upload } from 'lucide-react';

export default function SettingsPage() {
  const [branding, setBranding] = useState<CenterInfo>(getCenterBranding());
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setBranding(getCenterBranding());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    try {
      updateCenterBranding(branding);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'فشل حفظ الإعدادات');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      setBranding(prev => ({ ...prev, logo_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      setBranding(prev => ({ ...prev, cover_url: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span>إعدادات هوية السنتر (Center Branding)</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          تخصيص اسم السنتر، الشعار، صورة الغلاف (Banner)، ورقم الهاتف والبيانات المعتمدة
        </p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold flex items-center gap-2 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>تم حفظ هوية السنتر وصورة الغلاف بنجاح!</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl font-bold border border-rose-200">
              {error}
            </div>
          )}

          {/* Logo Upload & Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
              {branding.logo_url ? (
                <img src={branding.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-right">
              <label className="block text-xs font-black text-slate-800 mb-0.5">شعار السنتر الرسمي (Logo)</label>
              <p className="text-[11px] text-slate-400 mb-3">
                يظهر الشعار في الترويسة، شريط التنقل، وصفحة الدخول
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block text-xs text-slate-500 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Cover Image Upload & Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="w-full sm:w-44 h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
              {branding.cover_url ? (
                <img src={branding.cover_url} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <FileImage className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-right">
              <label className="block text-xs font-black text-slate-800 mb-0.5">غلاف الواجهة الرئيسية (Cover Banner)</label>
              <p className="text-[11px] text-slate-400 mb-3">
                البانر العريض المعروض في قمة لوحة التحكم الرئيسية للأكاديمية
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="block text-xs text-slate-500 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم السنتر (Center Name) *</label>
              <input
                type="text"
                required
                value={branding.name}
                onChange={e => setBranding({ ...branding, name: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">العملة المعتمدة للنظام</label>
              <input
                type="text"
                value={branding.currency}
                onChange={e => setBranding({ ...branding, currency: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم تواصل السنتر</label>
              <input
                type="text"
                value={branding.phone}
                onChange={e => setBranding({ ...branding, phone: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">عنوان المقر الرئيسي</label>
              <input
                type="text"
                value={branding.address}
                onChange={e => setBranding({ ...branding, address: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 active:scale-98 transition-all"
            >
              حفظ وتطبيق إعدادات الهوية
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

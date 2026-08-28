'use client';

import React, { useState, useEffect } from 'react';
import { getCenterBranding, updateCenterBranding } from '@/services/settings-service';
import { CenterInfo } from '@/types';
import { Settings, Building2, Phone, MapPin, CheckCircle2, Upload, Camera } from 'lucide-react';

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-purple-600" />
          <span>إعدادات هوية السنتر (Center Branding)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          تخصيص اسم السنتر، الشعار، رقم التليفون، والشهادات والتقارير
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>تم حفظ هوية وإعدادات السنتر بنجاح!</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl font-semibold border border-rose-200">
              {error}
            </div>
          )}

          {/* Logo Upload & Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="w-20 h-20 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden relative">
              {branding.logo_url ? (
                <img src={branding.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">شعار السنتر (Logo)</label>
              <p className="text-[11px] text-slate-500 mb-2">
                سيظهر الشعار في صفحة الدخول، الترويسة، وتقارير الـ PDF
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block text-xs text-slate-500 file:mr-0 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم السنتر (Center Name) *</label>
              <input
                type="text"
                required
                value={branding.name}
                onChange={e => setBranding({ ...branding, name: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">العملة المعتمدة</label>
              <input
                type="text"
                value={branding.currency}
                onChange={e => setBranding({ ...branding, currency: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم هاتف السنتر</label>
              <input
                type="text"
                value={branding.phone || ''}
                onChange={e => setBranding({ ...branding, phone: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">عنوان السنتر الرئيسي</label>
              <input
                type="text"
                value={branding.address || ''}
                onChange={e => setBranding({ ...branding, address: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

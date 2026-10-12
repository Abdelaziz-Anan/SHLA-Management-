'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLogs, deleteAuditLog, clearAuditLogs } from '@/services/audit-service';
import { getCurrentUser } from '@/services/auth-service';
import { AuditLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { exportAuditLogsToCSV } from '@/lib/export-utils';
import { ShieldCheck, Download, User, Clock, FileText, Trash2, AlertTriangle } from 'lucide-react';

export default function AuditLogPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const isManager = currentUser?.role === 'manager';

  const loadData = () => {
    setCurrentUser(getCurrentUser());
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteLog = (logId: string) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذا القيد من سجل العمليات؟')) return;
    try {
      deleteAuditLog(logId);
      loadData();
      alert('تم حذف القيد من السجل');
    } catch (e: any) {
      alert(e.message || 'فشل حذف القيد');
    }
  };

  const handleClearAllLogs = () => {
    try {
      clearAuditLogs();
      setIsResetModalOpen(false);
      loadData();
      alert('تم مسح سجل العمليات بالكامل بنجاح');
    } catch (e: any) {
      alert(e.message || 'فشل مسح السجل');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>سجل تحركات وعمليات النظام (Audit Logs)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            سجل تتبع كافة الإضافات، التعديلات، وعمليات السداد بالأكاديمية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {isManager && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all active:scale-98"
              title="خاص بالمديرة: مسح سجل العمليات بالكامل"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>مسح السجل بالكامل</span>
            </button>
          )}

          <button
            onClick={() => exportAuditLogsToCSV(logs)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            title="تصدير سجل العمليات إلى CSV"
          >
            <Download className="w-4 h-4" />
            <span>تصدير السجل CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400 text-xs font-semibold">
            لا توجد سجلات عمليات حتى الآن
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW */}
            <div className="block sm:hidden divide-y divide-slate-100">
              {logs.map((log, idx) => (
                <div key={log.id} className="p-4 space-y-2 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start justify-between">
                    <span className="font-black text-xs text-slate-900">{log.user_name || 'النظام'}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {log.entity_type}
                      </span>
                      {isManager && (
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                          title="حذف القيد"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-blue-700">{log.action}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(log.created_at).toLocaleString('ar-EG')}
                  </p>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden sm:block overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md text-slate-500 font-bold border-b border-slate-200/80 z-10 shadow-2xs">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">اسم المستخدِم</th>
                    <th className="p-4">الحدث / الحركة (Action)</th>
                    <th className="p-4">نوع الكيان</th>
                    <th className="p-4">التاريخ والوقت</th>
                    {isManager && <th className="p-4 text-center">إجراءات</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {logs.map((log, idx) => {
                    const entityColors: Record<string, string> = {
                      Payment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      Student: 'bg-blue-50 text-blue-700 border-blue-200',
                      Group: 'bg-purple-50 text-purple-700 border-purple-200',
                      Settlement: 'bg-amber-50 text-amber-700 border-amber-200',
                      User: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    };
                    const badgeClass = entityColors[log.entity_type] || 'bg-slate-100 text-slate-700 border-slate-200';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/90 transition-colors even:bg-slate-50/40">
                        <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-4 font-black text-slate-900">{log.user_name || 'النظام'}</td>
                        <td className="p-4 font-bold text-slate-800">{log.action}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${badgeClass}`}>
                            {log.entity_type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {new Date(log.created_at).toLocaleString('ar-EG')}
                        </td>
                        {isManager && (
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="حذف القيد (المديرة فقط)"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* RESET AUDIT LOGS MODAL (MANAGER ONLY) */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 animate-slide-up duration-300">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-center font-black text-lg text-slate-900">
              مسح سجل العمليات بالكامل
            </h3>
            <p className="text-center text-xs text-slate-500 mt-2 leading-relaxed">
              تحذير: هذا الإجراء مخصص لـ <strong>مديرة الأكاديمية</strong> فقط. سيؤدي هذا الإجراء إلى حذف جميع سجلات التحركات والعمليات السابقة بالكامل. لن يمكن التراجع بعد التنفيذ.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                إلغاء التراجع
              </button>
              <button
                onClick={handleClearAllLogs}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all"
              >
                تأكيد مسح السجل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

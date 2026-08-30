'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '@/services/audit-service';
import { AuditLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { exportAuditLogsToCSV } from '@/lib/export-utils';
import { ShieldCheck, Download, User, Clock, FileText } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

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
            سجل غير قابل للتعديل لتتبع كافة الإضافات، التعديلات، وعمليات السداد
          </p>
        </div>

        <button
          onClick={() => exportAuditLogsToCSV(logs)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-98"
          title="تصدير سجل العمليات إلى CSV"
        >
          <Download className="w-4 h-4" />
          <span>تصدير السجل CSV</span>
        </button>
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
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {log.entity_type}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-blue-700">{log.action}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(log.created_at).toLocaleString('ar-EG')}
                  </p>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">اسم المستخدِم</th>
                    <th className="p-4">الحدث / الحركة (Action)</th>
                    <th className="p-4">نوع الكيان</th>
                    <th className="p-4">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {logs.map((log, idx) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-black text-slate-900">{log.user_name || 'النظام'}</td>
                      <td className="p-4 font-bold text-slate-800">{log.action}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {log.entity_type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {new Date(log.created_at).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

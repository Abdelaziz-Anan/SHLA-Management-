'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '@/services/audit-service';
import { AuditLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, Clock, User, FileText } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-purple-600" />
          <span>سجل تحركات وعمليات النظام (Audit Logs)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          سجل غير قابل للتعديل لتتبع كافة الإضافات، التعديلات، وتسجيلات الدخول
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              لا توجد سجلات عمليات حتى الآن
            </div>
          ) : (
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
                    <td className="p-4 font-extrabold text-slate-900">{log.user_name || 'النظام'}</td>
                    <td className="p-4 font-bold text-slate-800">{log.action}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
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
          )}
        </div>
      </div>
    </div>
  );
}

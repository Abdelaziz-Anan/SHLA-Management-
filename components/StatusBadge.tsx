import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type?: 'group' | 'payment' | 'user' | 'owner';
  className?: string;
}

export function StatusBadge({ status, type = 'payment', className }: StatusBadgeProps) {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let pingColor = 'bg-slate-400';
  let dotShadow = '';
  let label = status;
  let isPulsing = false;

  if (type === 'payment') {
    switch (status) {
      case 'Fully Paid':
      case 'مكتمل':
      case 'valid':
        badgeStyle = 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90 shadow-2xs shadow-emerald-500/10 font-bold';
        dotColor = 'bg-emerald-500';
        pingColor = 'bg-emerald-400';
        dotShadow = 'shadow-[0_0_8px_rgba(16,185,129,0.6)]';
        label = status === 'valid' ? 'صحيحة ومعتمدة' : 'مسدد بالكامل';
        isPulsing = true;
        break;
      case 'Partially Paid':
      case 'جزئي':
        badgeStyle = 'bg-amber-50/90 text-amber-800 border-amber-200/90 shadow-2xs shadow-amber-500/10 font-bold';
        dotColor = 'bg-amber-500';
        pingColor = 'bg-amber-400';
        dotShadow = 'shadow-[0_0_8px_rgba(245,158,11,0.6)]';
        label = 'سداد جزئي';
        isPulsing = true;
        break;
      case 'Not Paid':
      case 'غير مدفوع':
        badgeStyle = 'bg-rose-50/90 text-rose-800 border-rose-200/90 shadow-2xs shadow-rose-500/10 font-black';
        dotColor = 'bg-rose-500';
        pingColor = 'bg-rose-400';
        dotShadow = 'shadow-[0_0_8px_rgba(244,63,94,0.6)]';
        label = 'غير مدفوع';
        isPulsing = true;
        break;
      case 'Overpaid':
        badgeStyle = 'bg-blue-50/90 text-blue-800 border-blue-200/90 font-bold';
        dotColor = 'bg-blue-500';
        pingColor = 'bg-blue-400';
        dotShadow = 'shadow-[0_0_8px_rgba(59,130,246,0.6)]';
        label = 'مدفوع بزيادة';
        break;
      case 'reversed':
      case 'ملغاة/مصححة':
        badgeStyle = 'bg-slate-100 text-slate-500 line-through border-slate-300';
        dotColor = 'bg-slate-400';
        label = 'ملغاة / مصححة';
        break;
    }
  } else if (type === 'group') {
    switch (status) {
      case 'active':
      case 'نشطة':
        badgeStyle = 'bg-blue-50/90 text-blue-800 border-blue-200/90 shadow-2xs shadow-blue-500/10 font-bold';
        dotColor = 'bg-blue-500';
        pingColor = 'bg-blue-400';
        dotShadow = 'shadow-[0_0_8px_rgba(59,130,246,0.6)]';
        label = 'نشطة حالياً';
        isPulsing = true;
        break;
      case 'completed':
      case 'مكتملة':
        badgeStyle = 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90 font-bold';
        dotColor = 'bg-emerald-500';
        label = 'مكتملة الكورس';
        break;
      case 'archived':
      case 'مؤرشفة':
        badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
        dotColor = 'bg-slate-400';
        label = 'مؤرشفة';
        break;
    }
  } else if (type === 'user' || type === 'owner') {
    if (status === 'manager' || status === 'مدير') {
      badgeStyle = 'bg-purple-50/90 text-purple-800 border-purple-200/90 font-black';
      dotColor = 'bg-purple-500';
      pingColor = 'bg-purple-400';
      dotShadow = 'shadow-[0_0_8px_rgba(168,85,247,0.6)]';
      label = 'مدير السنتر (Manager)';
      isPulsing = true;
    } else {
      badgeStyle = 'bg-blue-50/90 text-blue-800 border-blue-200/90 font-bold';
      dotColor = 'bg-blue-500';
      dotShadow = 'shadow-[0_0_6px_rgba(59,130,246,0.4)]';
      label = 'مساعد (Assistant)';
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 select-none shadow-2xs',
        badgeStyle,
        className
      )}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0 items-center justify-center">
        {isPulsing && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              pingColor
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColor, dotShadow)} />
      </span>
      <span>{label}</span>
    </span>
  );
}

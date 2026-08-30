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
  let label = status;

  if (type === 'payment') {
    switch (status) {
      case 'Fully Paid':
      case 'مكتمل':
      case 'valid':
        badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs shadow-emerald-500/10';
        dotColor = 'bg-emerald-500';
        label = status === 'valid' ? 'صحيحة ومعتمدة' : 'مسدد بالكامل';
        break;
      case 'Partially Paid':
      case 'جزئي':
        badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-2xs shadow-amber-500/10';
        dotColor = 'bg-amber-500';
        label = 'سداد جزئي';
        break;
      case 'Not Paid':
      case 'غير مدفوع':
        badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs shadow-rose-500/10';
        dotColor = 'bg-rose-500';
        label = 'غير مدفوع';
        break;
      case 'Overpaid':
        badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200/80';
        dotColor = 'bg-blue-500';
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
        badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200/80 shadow-2xs shadow-blue-500/10';
        dotColor = 'bg-blue-500';
        label = 'نشطة حالياً';
        break;
      case 'completed':
      case 'مكتملة':
        badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
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
      badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200/80 font-bold';
      dotColor = 'bg-purple-500';
      label = 'مدير السنتر (Manager)';
    } else {
      badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200/80 font-semibold';
      dotColor = 'bg-blue-500';
      label = 'مساعد (Assistant)';
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all select-none',
        badgeStyle,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor)} />
      <span>{label}</span>
    </span>
  );
}

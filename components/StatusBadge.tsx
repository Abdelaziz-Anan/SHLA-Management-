import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type?: 'group' | 'payment' | 'user' | 'owner';
  className?: string;
}

export function StatusBadge({ status, type = 'payment', className }: StatusBadgeProps) {
  let colorStyle = 'bg-slate-100 text-slate-800 border-slate-200';

  if (type === 'payment') {
    switch (status) {
      case 'Fully Paid':
      case 'مكتمل':
      case 'valid':
        colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Partially Paid':
      case 'جزئي':
        colorStyle = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Not Paid':
      case 'غير مدفوع':
        colorStyle = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'Overpaid':
        colorStyle = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'reversed':
      case 'ملغاة/مصححة':
        colorStyle = 'bg-slate-100 text-slate-500 line-through border-slate-300';
        break;
    }
  } else if (type === 'group') {
    switch (status) {
      case 'active':
      case 'نشطة':
        colorStyle = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'completed':
      case 'مكتملة':
        colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'archived':
      case 'مؤرشفة':
        colorStyle = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
    }
  } else if (type === 'user') {
    colorStyle = status === 'manager' || status === 'مدير'
      ? 'bg-purple-50 text-purple-700 border-purple-200 font-semibold'
      : 'bg-cyan-50 text-cyan-700 border-cyan-200';
  } else if (type === 'owner') {
    colorStyle = status === 'manager'
      ? 'bg-purple-50 text-purple-700 border-purple-200 font-semibold'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  const label =
    status === 'active' ? 'نشطة' :
    status === 'completed' ? 'مكتملة' :
    status === 'archived' ? 'مؤرشفة' :
    status === 'manager' ? 'المدير (Manager)' :
    status === 'assistant' ? 'مساعد (Assistant)' :
    status === 'valid' ? 'صحيحة' :
    status === 'reversed' ? 'ملغاة' : status;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm transition-all',
        colorStyle,
        className
      )}
    >
      {label}
    </span>
  );
}

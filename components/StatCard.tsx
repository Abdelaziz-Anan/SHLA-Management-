import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';
  badge?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  badge,
}: StatCardProps) {
  const iconVariants = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100/80 shadow-xs shadow-blue-500/10',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/80 shadow-xs shadow-emerald-500/10',
    amber: 'bg-amber-50 text-amber-600 border-amber-100/80 shadow-xs shadow-amber-500/10',
    purple: 'bg-purple-50 text-purple-600 border-purple-100/80 shadow-xs shadow-purple-500/10',
    rose: 'bg-rose-50 text-rose-600 border-rose-100/80 shadow-xs shadow-rose-500/10',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const topAccents = {
    blue: 'hover:border-blue-300 group-hover:border-blue-400',
    emerald: 'hover:border-emerald-300 group-hover:border-emerald-400',
    amber: 'hover:border-amber-300 group-hover:border-amber-400',
    purple: 'hover:border-purple-300 group-hover:border-purple-400',
    rose: 'hover:border-rose-300 group-hover:border-rose-400',
    slate: 'hover:border-slate-300 group-hover:border-slate-400',
  };

  return (
    <div className={cn(
      'bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group',
      topAccents[variant]
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className={cn('p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-transform duration-200 group-hover:scale-105', iconVariants[variant])}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {badge && (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm font-semibold text-slate-500 line-clamp-1">{title}</p>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mt-1 tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

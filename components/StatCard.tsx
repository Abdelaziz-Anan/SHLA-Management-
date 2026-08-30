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
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  badge,
  className,
}: StatCardProps) {
  const iconVariants = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100/80 group-hover:shadow-glow-blue',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/80 group-hover:shadow-glow-emerald',
    amber: 'bg-amber-50 text-amber-600 border-amber-100/80 group-hover:shadow-glow-amber',
    purple: 'bg-purple-50 text-purple-600 border-purple-100/80 group-hover:shadow-glow-purple',
    rose: 'bg-rose-50 text-rose-600 border-rose-100/80 group-hover:shadow-glow-rose',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const topGradients = {
    blue: 'from-blue-500 via-blue-400 to-transparent',
    emerald: 'from-emerald-500 via-emerald-400 to-transparent',
    amber: 'from-amber-500 via-amber-400 to-transparent',
    purple: 'from-purple-500 via-purple-400 to-transparent',
    rose: 'from-rose-500 via-rose-400 to-transparent',
    slate: 'from-slate-400 via-slate-300 to-transparent',
  };

  const borderHovers = {
    blue: 'hover:border-blue-300/80 group-hover:border-blue-400/80',
    emerald: 'hover:border-emerald-300/80 group-hover:border-emerald-400/80',
    amber: 'hover:border-amber-300/80 group-hover:border-amber-400/80',
    purple: 'hover:border-purple-300/80 group-hover:border-purple-400/80',
    rose: 'hover:border-rose-300/80 group-hover:border-rose-400/80',
    slate: 'hover:border-slate-300 group-hover:border-slate-400',
  };

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover-lift shine-sweep flex flex-col justify-between group overflow-hidden transition-all duration-300',
        borderHovers[variant],
        className
      )}
    >
      {/* Top light bar accent */}
      <div
        className={cn(
          'absolute top-0 right-0 left-0 h-[2.5px] bg-gradient-to-l opacity-80 group-hover:opacity-100 transition-opacity duration-300',
          topGradients[variant]
        )}
      />

      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            'p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 group-hover:scale-108',
            iconVariants[variant]
          )}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {badge && (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70 shadow-2xs">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm font-bold text-slate-500 line-clamp-1">{title}</p>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mt-1 tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-1 font-semibold">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

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
  const styles = {
    blue: 'bg-blue-50/50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50/50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50/50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50/50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50/50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className={cn('p-3 rounded-xl border', styles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1 font-normal">{subtitle}</p>}
      </div>
    </div>
  );
}

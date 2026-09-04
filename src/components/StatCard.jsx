import React from 'react';
import { ChevronRight } from 'lucide-react';

const VARIANTS = {
  blue: {
    border: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/50',
    bg: 'bg-gradient-to-br from-slate-900 to-slate-950',
    iconBg: 'bg-blue-500/10',
    iconText: 'text-blue-400',
    titleColor: 'text-blue-400',
    valueDefault: 'text-slate-100',
    shadow: 'shadow-blue-950/20',
  },
  emerald: {
    border: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500/50',
    bg: 'bg-gradient-to-br from-slate-900 to-slate-950',
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
    titleColor: 'text-emerald-400',
    valueDefault: 'text-emerald-400',
    shadow: 'shadow-emerald-950/10',
  },
  amber: {
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-500/50',
    bg: 'bg-slate-900/90',
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-400',
    titleColor: 'text-amber-400',
    valueDefault: 'text-amber-400',
    shadow: 'shadow-amber-950/10',
  },
  purple: {
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500/50',
    bg: 'bg-slate-900/90',
    iconBg: 'bg-purple-500/10',
    iconText: 'text-purple-400',
    titleColor: 'text-purple-400',
    valueDefault: 'text-purple-300',
    shadow: 'shadow-purple-950/10',
  },
  rose: {
    border: 'border-rose-500/30',
    hoverBorder: 'hover:border-rose-500/50',
    bg: 'bg-slate-900/90',
    iconBg: 'bg-rose-500/10',
    iconText: 'text-rose-400',
    titleColor: 'text-rose-400',
    valueDefault: 'text-rose-400',
    shadow: 'shadow-rose-950/10',
  },
  slate: {
    border: 'border-slate-800',
    hoverBorder: 'hover:border-slate-700',
    bg: 'bg-slate-900/90',
    iconBg: 'bg-slate-800',
    iconText: 'text-slate-400',
    titleColor: 'text-slate-400',
    valueDefault: 'text-slate-200',
    shadow: 'shadow-slate-950/10',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'slate',
  valueColor,
  onClick,
  actionText,
  className = '',
}) {
  const v = VARIANTS[variant] || VARIANTS.slate;
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border ${v.border} ${v.bg} shadow-xl ${v.shadow} transition-all duration-200 ${
        isClickable ? `cursor-pointer ${v.hoverBorder} group hover:shadow-2xl` : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wider ${v.titleColor}`}>
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${v.iconBg} ${v.iconText}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2">
        <div
          className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
            valueColor || v.valueDefault
          }`}
        >
          {value}
        </div>

        {(subtitle || actionText) && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            {subtitle && <span>{subtitle}</span>}
            {actionText && (
              <span className={`flex items-center space-x-0.5 font-medium ml-auto ${v.titleColor} group-hover:translate-x-0.5 transition-transform`}>
                <span>{actionText}</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

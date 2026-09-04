import React from 'react';
import { ChevronRight } from 'lucide-react';

const VARIANTS = {
  blue: {
    border: 'border-blue-500/20 hover:border-blue-500/40',
    bg: 'bg-[#101726]/90 hover:bg-[#131d31]',
    iconBg: 'bg-blue-500/10 border border-blue-500/20',
    iconText: 'text-blue-400',
    titleColor: 'text-blue-400',
    valueDefault: 'text-slate-100',
    glow: 'group-hover:opacity-100',
    glowColor: 'from-blue-500/10',
  },
  emerald: {
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    bg: 'bg-[#101726]/90 hover:bg-[#131d31]',
    iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
    iconText: 'text-emerald-400',
    titleColor: 'text-emerald-400',
    valueDefault: 'text-emerald-400',
    glow: 'group-hover:opacity-100',
    glowColor: 'from-emerald-500/10',
  },
  amber: {
    border: 'border-amber-500/20 hover:border-amber-500/40',
    bg: 'bg-[#101726]/90 hover:bg-[#131d31]',
    iconBg: 'bg-amber-500/10 border border-amber-500/20',
    iconText: 'text-amber-400',
    titleColor: 'text-amber-400',
    valueDefault: 'text-amber-400',
    glow: 'group-hover:opacity-100',
    glowColor: 'from-amber-500/10',
  },
  purple: {
    border: 'border-purple-500/20 hover:border-purple-500/40',
    bg: 'bg-[#101726]/90 hover:bg-[#131d31]',
    iconBg: 'bg-purple-500/10 border border-purple-500/20',
    iconText: 'text-purple-400',
    titleColor: 'text-purple-400',
    valueDefault: 'text-purple-300',
    glow: 'group-hover:opacity-100',
    glowColor: 'from-purple-500/10',
  },
  rose: {
    border: 'border-rose-500/20 hover:border-rose-500/40',
    bg: 'bg-[#101726]/90 hover:bg-[#131d31]',
    iconBg: 'bg-rose-500/10 border border-rose-500/20',
    iconText: 'text-rose-400',
    titleColor: 'text-rose-400',
    valueDefault: 'text-rose-400',
    glow: 'group-hover:opacity-100',
    glowColor: 'from-rose-500/10',
  },
  slate: {
    border: 'border-slate-800 hover:border-slate-700',
    bg: 'bg-[#101726]/90 hover:bg-[#131d31]',
    iconBg: 'bg-slate-800/80 border border-slate-700/50',
    iconText: 'text-slate-400',
    titleColor: 'text-slate-400',
    valueDefault: 'text-slate-200',
    glow: 'group-hover:opacity-60',
    glowColor: 'from-slate-700/10',
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
      className={`group relative overflow-hidden p-5 rounded-2xl border ${v.border} ${v.bg} card-emboss transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {/* Subtle corner light reflection */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${v.glowColor} to-transparent opacity-0 ${v.glow} transition-opacity duration-300 pointer-events-none rounded-bl-full`} />

      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold tracking-wider uppercase ${v.titleColor}`}>
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${v.iconBg} ${v.iconText} transition-transform group-hover:scale-110 duration-200`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div
          className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
            valueColor || v.valueDefault
          }`}
        >
          {value}
        </div>

        {(subtitle || actionText) && (
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5">
            {subtitle && <span className="truncate">{subtitle}</span>}
            {actionText && (
              <span className={`flex items-center space-x-1 font-semibold ml-auto ${v.titleColor} group-hover:translate-x-1 transition-transform`}>
                <span>{actionText}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

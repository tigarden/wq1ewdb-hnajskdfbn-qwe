import React from 'react';
import { ChevronRight } from 'lucide-react';

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
  const isClickable = Boolean(onClick);

  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          text: 'text-emerald-400',
          indicator: 'bg-emerald-500',
        };
      case 'amber':
        return {
          text: 'text-amber-400',
          indicator: 'bg-amber-500',
        };
      case 'rose':
        return {
          text: 'text-rose-400',
          indicator: 'bg-rose-500',
        };
      case 'blue':
        return {
          text: 'text-blue-400',
          indicator: 'bg-blue-500',
        };
      default:
        return {
          text: 'text-slate-200',
          indicator: 'bg-slate-500',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`surface-card p-3.5 sm:p-4 rounded-lg transition-colors ${
        isClickable ? 'cursor-pointer hover:border-white/20' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`w-1.5 h-1.5 rounded-full ${v.indicator}`} />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            {title}
          </span>
        </div>
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
      </div>

      <div className="mt-2">
        <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${valueColor || v.text}`}>
          {value}
        </div>

        {(subtitle || actionText) && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            {subtitle && <span className="truncate">{subtitle}</span>}
            {actionText && (
              <span className="inline-flex items-center space-x-1 font-semibold text-blue-400 ml-auto">
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


import React from 'react';

const VARIANTS = {
  item: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  payment: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  debt: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
  profit: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  blue: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
  neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  car: 'bg-slate-800/90 text-blue-300 border-slate-700/70 font-medium',
  article: 'bg-[#090d16] text-blue-400 border-blue-500/30 font-mono font-semibold',
};

const SIZES = {
  xs: 'px-1.5 py-0.2 text-[10px]',
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  icon: Icon,
  className = '',
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.neutral;
  const sizeClass = SIZES[size] || SIZES.sm;

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded-lg border backdrop-blur-sm ${variantClass} ${sizeClass} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  );
}

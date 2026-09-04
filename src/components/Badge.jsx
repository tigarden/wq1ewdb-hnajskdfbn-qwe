import React from 'react';

const VARIANTS = {
  item: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  payment: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  debt: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  profit: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  blue: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  neutral: 'bg-slate-900 text-slate-300 border-slate-800',
  car: 'bg-slate-900 text-slate-300 border-slate-800 font-medium',
  article: 'bg-slate-950 text-blue-400 border-blue-500/30 font-mono font-bold',
};

const SIZES = {
  xs: 'px-1.5 py-0.5 text-[10px] leading-none',
  sm: 'px-2 py-0.5 text-[11px] leading-tight',
  md: 'px-2.5 py-1 text-xs leading-tight',
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
      className={`inline-flex items-center space-x-1 rounded-md border font-medium ${variantClass} ${sizeClass} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  );
}


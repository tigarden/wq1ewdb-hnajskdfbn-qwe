import React from 'react';

const VARIANTS = {
  item: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  payment: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  debt: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  profit: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  neutral: 'bg-slate-800 text-slate-300 border-slate-700/50',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[10px]',
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
      className={`inline-flex items-center space-x-1 font-medium rounded-md border ${variantClass} ${sizeClass} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

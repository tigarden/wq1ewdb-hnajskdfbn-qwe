import React from 'react';

const VARIANTS = {
  item: {
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-xs shadow-amber-500/5',
    dot: 'bg-amber-400',
  },
  payment: {
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 shadow-xs shadow-emerald-500/5',
    dot: 'bg-emerald-400',
  },
  debt: {
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/25 shadow-xs shadow-rose-500/5',
    dot: 'bg-rose-400',
  },
  profit: {
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 shadow-xs shadow-emerald-500/5',
    dot: 'bg-emerald-400',
  },
  pending: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-xs shadow-amber-500/5',
    dot: 'bg-amber-400 animate-pulse',
  },
  blue: {
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/25 shadow-xs shadow-blue-500/5',
    dot: 'bg-blue-400',
  },
  purple: {
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
    dot: 'bg-purple-400',
  },
  neutral: {
    badge: 'bg-white/[0.04] text-slate-300 border-white/[0.08]',
    dot: 'bg-slate-400',
  },
  car: {
    badge: 'bg-white/[0.04] text-slate-300 border-white/[0.08] font-medium tracking-tight',
    dot: null,
  },
  article: {
    badge: 'bg-blue-950/40 text-blue-400 border-blue-500/30 font-mono font-bold tracking-tight',
    dot: null,
  },
};

const SIZES = {
  xs: 'px-2 py-0.5 text-xs font-mono font-medium rounded-md',
  sm: 'px-2.5 py-0.5 text-xs 2xl:text-sm font-medium rounded-md',
  md: 'px-3 py-1 text-xs 2xl:text-sm font-medium rounded-lg',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  icon: Icon,
  showDot = false,
  className = '',
}) {
  const config = VARIANTS[variant] || VARIANTS.neutral;
  const sizeClass = SIZES[size] || SIZES.sm;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 border font-medium select-none backdrop-blur-xs ${config.badge} ${sizeClass} ${className}`}
    >
      {showDot && config.dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      )}
      {Icon && <Icon className="w-3 h-3 shrink-0 opacity-80" />}
      <span className="truncate">{children}</span>
    </span>
  );
}


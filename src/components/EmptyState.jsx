import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Нет данных',
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`text-center py-8 px-4 rounded-lg bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-2.5 ${className}`}>
      <div className="w-9 h-9 2xl:w-10 2xl:h-10 rounded-md bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center">
        <Icon className="w-4 h-4 2xl:w-5 2xl:h-5" />
      </div>
      <div className="space-y-0.5 max-w-sm">
        <h4 className="text-xs sm:text-sm 2xl:text-base font-semibold text-slate-200">{title}</h4>
        {description && (
          <p className="text-xs 2xl:text-sm text-slate-400 leading-relaxed">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-sm 2xl:btn-md btn-primary mt-1"
        >
          <Plus className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}


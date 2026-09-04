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
    <div className={`text-center py-10 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="p-3 rounded-2xl bg-slate-800/60 text-slate-400 border border-slate-700/40 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        {description && (
          <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

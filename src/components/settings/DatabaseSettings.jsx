import React, { useState } from 'react';
import { Database, Server, RefreshCw, Upload, Download, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import Badge from '../Badge';

export default function DatabaseSettings({
  backendUrl,
  updateBackendUrl,
  backendHealth,
  backendLoading,
  checkBackend,
  syncToPostgres,
  pullFromPostgres,
}) {
  const [urlInput, setUrlInput] = useState(backendUrl || '');
  const [syncMsg, setSyncMsg] = useState(null);

  const handleSaveUrl = (e) => {
    e.preventDefault();
    updateBackendUrl(urlInput.trim());
    setSyncMsg({ success: true, text: 'URL сервера API сохранен' });
  };

  const handleSyncToDb = async () => {
    if (!window.confirm('Сохранить все текущие данные в базу данных PostgreSQL?')) return;
    setSyncMsg(null);
    const res = await syncToPostgres();
    setSyncMsg(res);
  };

  const handlePullFromDb = async () => {
    if (!window.confirm('Загрузить данные из базы PostgreSQL? Текущие локальные записи будут обновлены.')) return;
    setSyncMsg(null);
    const res = await pullFromPostgres();
    if (res.success) {
      setSyncMsg({ success: true, text: 'Данные успешно загружены из базы!' });
    } else {
      setSyncMsg({ success: false, text: res.error || 'Ошибка загрузки данных' });
    }
  };

  const isOnline = backendHealth?.status === 'online';
  const isDegraded = backendHealth?.status === 'degraded';

  return (
    <div className="surface-card rounded-xl border border-white/5 p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <span>Собственный сервер API (FastAPI + PostgreSQL)</span>
              <Badge
                variant={isOnline ? 'emerald' : isDegraded ? 'amber' : 'slate'}
                size="sm"
              >
                {isOnline
                  ? `В сети (${backendHealth.database_type || 'DB'})`
                  : isDegraded
                  ? 'Ошибка БД'
                  : 'Не подключен'}
              </Badge>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Подключение к локальному Docker контейнеру или удаленному серверу Debet.auto
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={checkBackend}
          disabled={backendLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${backendLoading ? 'animate-spin text-blue-400' : ''}`} />
          <span>Проверить связь</span>
        </button>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleSaveUrl} className="flex flex-col sm:flex-row gap-2 max-w-xl">
        <div className="relative flex-1">
          <Server className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="http://localhost:8000/api или https://api.yourdomain.com/api"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
        >
          Сохранить URL
        </button>
      </form>

      {/* Sync Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={handleSyncToDb}
          disabled={backendLoading || !isOnline}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors disabled:opacity-40"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Выгрузить данные в базу</span>
        </button>

        <button
          type="button"
          onClick={handlePullFromDb}
          disabled={backendLoading || !isOnline}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 text-xs font-medium transition-colors disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Загрузить данные из базы</span>
        </button>
      </div>

      {/* Sync Feedback Alert */}
      {syncMsg && (
        <div
          className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
            syncMsg.success
              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
          }`}
        >
          {syncMsg.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{syncMsg.text || syncMsg.message}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5 text-xs text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300">Локальный запуск сервера API:</div>
        <div className="font-mono text-xs text-blue-300 bg-slate-950/60 px-2 py-1 rounded border border-white/5 select-all">
          uvicorn backend.main:app --reload --port 8000
        </div>
      </div>
    </div>
  );
}

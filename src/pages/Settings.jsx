import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  GitBranch, 
  Cloud, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Key,
  ShieldCheck
} from 'lucide-react';
import { verifyGitHubToken } from '../services/githubApi';

export default function Settings() {
  const { 
    settings, 
    updateSettings, 
    syncStatus, 
    syncError, 
    lastSyncTime, 
    pushToGitHub, 
    pullFromGitHub, 
    exportToExcel, 
    exportJsonBackup, 
    importJsonBackup 
  } = useData();

  const [tokenInput, setTokenInput] = useState(settings.token || '');
  const [ownerInput, setOwnerInput] = useState(settings.owner || 'tigarden');
  const [repoInput, setRepoInput] = useState(settings.repo || 'wq1ewdb-hnajskdfbn-qwe');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState(null);

  const handleSaveGitHubConfig = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyMsg(null);

    const token = tokenInput.trim();
    if (!token) {
      updateSettings({ token: '', owner: ownerInput.trim(), repo: repoInput.trim() });
      setVerifyMsg({ success: true, text: 'Настройки сохранены в режиме оффлайн (без токена).' });
      setIsVerifying(false);
      return;
    }

    const res = await verifyGitHubToken(token);
    setIsVerifying(false);

    if (res.valid) {
      updateSettings({
        token,
        owner: ownerInput.trim() || res.user.login,
        repo: repoInput.trim(),
      });
      setVerifyMsg({
        success: true,
        text: `Успешно авторизован пользователь: @${res.user.login}! Настройки сохранены.`,
      });
    } else {
      setVerifyMsg({
        success: false,
        text: `Ошибка проверки токена: ${res.error}`,
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const res = importJsonBackup(text);
      if (res.success) {
        alert('Резервная копия успешно восстановлена!');
      } else {
        alert(`Ошибка импорта: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Синхронизация и настройки
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Подключение к вашему репозиторию GitHub и управление резервными копиями
        </p>
      </div>

      {/* Section 1: GitHub API Integration */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Подключение к GitHub API
            </h2>
            <p className="text-xs text-slate-400">
              Сохранение данных прямо в репозиторий под вашей учетной записью <strong className="text-slate-300">tigarden</strong>
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              syncStatus === 'synced' ? 'bg-emerald-500 shadow-sm shadow-emerald-500' :
              syncStatus === 'unsaved' ? 'bg-amber-400 animate-pulse' :
              syncStatus === 'syncing' ? 'bg-blue-400 animate-spin' : 'bg-slate-600'
            }`} />
            <div>
              <span className="text-xs font-semibold text-slate-200">
                {syncStatus === 'synced' ? 'Подключено и синхронизировано с GitHub' :
                 syncStatus === 'unsaved' ? 'Есть локальные изменения (требуется сохранение)' :
                 syncStatus === 'syncing' ? 'Выполняется синхронизация...' :
                 syncStatus === 'no_token' ? 'Токен не указан (работает локально)' : 'Ошибка синхронизации'}
              </span>
              {lastSyncTime && (
                <p className="text-[11px] text-slate-500">
                  Последний обмен: {new Date(lastSyncTime).toLocaleString('ru-RU')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => pushToGitHub()}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
            >
              Отправить в GitHub
            </button>
            <button
              onClick={() => pullFromGitHub()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Загрузить из GitHub
            </button>
          </div>
        </div>

        {syncError && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}

        {/* GitHub Form */}
        <form onSubmit={handleSaveGitHubConfig} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                GitHub Personal Access Token (PAT)
              </label>
              <a
                href="https://github.com/settings/tokens?type=beta"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>Создать токен на GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="ghp_... или github_pat_..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              💡 Токен сохраняется исключительно в вашем браузере (LocalStorage) и никогда не передается третьим лицам. Достаточно прав <strong>Contents (read/write)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Владелец репозитория (Owner)
              </label>
              <input
                type="text"
                value={ownerInput}
                onChange={(e) => setOwnerInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Имя репозитория (Repository)
              </label>
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {verifyMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              verifyMsg.success ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/30 border border-rose-500/30 text-rose-300'
            }`}>
              {verifyMsg.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{verifyMsg.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
          >
            {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            <span>Проверить и сохранить токен</span>
          </button>
        </form>
      </div>

      {/* Section 2: Export & Local Backups */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Резервное копирование и Экспорт
            </h2>
            <p className="text-xs text-slate-400">
              Выгрузка в Excel (.xlsx) и полный файл резервной копии
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={exportToExcel}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 text-left group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Экспорт в Excel (.xlsx)</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Выгрузить файл .xlsx со всеми клиентами, деталями и расчетами
            </p>
          </button>

          <button
            onClick={exportJsonBackup}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 text-left group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Скачать JSON бэкап</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Сохранить резервную копию всей базы данных
            </p>
          </button>

          <label className="cursor-pointer p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 text-left group transition-all block">
            <div className="flex items-center justify-between mb-2">
              <Upload className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Восстановить из файла</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Загрузить ранее сохраненный JSON бэкап
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

    </div>
  );
}

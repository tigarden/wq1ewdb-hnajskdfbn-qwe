import React, { useState } from 'react';
import { Cloud, GitBranch, RefreshCw, Upload, Download, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import Badge from '../Badge';
import { testSupabase } from '../../services/supabase';
import { verifyGitHubToken } from '../../services/githubApi';

export default function CloudSyncSettings({
  supabaseConfig,
  updateSupabase,
  syncToSupabase,
  pullFromSupabase,
  supabaseStatus,
  settings,
  updateSettings,
  pushToGitHub,
  pullFromGitHub,
  syncStatus,
}) {
  // Supabase state
  const [sbUrl, setSbUrl] = useState(supabaseConfig.url || '');
  const [sbKey, setSbKey] = useState(supabaseConfig.key || '');
  const [sbTesting, setSbTesting] = useState(false);
  const [sbMsg, setSbMsg] = useState(null);

  // GitHub state
  const [ghToken, setGhToken] = useState(settings.token || '');
  const [ghOwner, setGhOwner] = useState(settings.owner || 'tigarden');
  const [ghRepo, setGhRepo] = useState(settings.repo || 'wq1ewdb-hnajskdfbn-qwe');
  const [ghTesting, setGhTesting] = useState(false);
  const [ghMsg, setGhMsg] = useState(null);

  // Supabase Handlers
  const handleSaveSupabase = async (e) => {
    e.preventDefault();
    setSbTesting(true);
    setSbMsg(null);

    const res = await testSupabase(sbUrl, sbKey);
    setSbTesting(false);

    if (res.success) {
      updateSupabase(sbUrl, sbKey);
      setSbMsg({ success: true, text: 'Подключение к Supabase успешно проверено и сохранено!' });
    } else {
      setSbMsg({ success: false, text: res.error || 'Ошибка подключения к Supabase' });
    }
  };

  const handleSyncSupabase = async () => {
    setSbMsg(null);
    const res = await syncToSupabase();
    if (res.success) {
      setSbMsg({ success: true, text: 'Данные выгружены в Supabase Cloud!' });
    } else {
      setSbMsg({ success: false, text: res.error || 'Ошибка синхронизации' });
    }
  };

  const handlePullSupabase = async () => {
    if (!window.confirm('Загрузить данные из Supabase Cloud? Локальные данные будут обновлены.')) return;
    setSbMsg(null);
    const res = await pullFromSupabase();
    if (res.success) {
      setSbMsg({ success: true, text: 'Данные успешно загружены из Supabase!' });
    } else {
      setSbMsg({ success: false, text: res.error || 'Ошибка загрузки' });
    }
  };

  // GitHub Handlers
  const handleSaveGitHub = async (e) => {
    e.preventDefault();
    setGhTesting(true);
    setGhMsg(null);

    const token = ghToken.trim();
    if (!token) {
      updateSettings({ token: '', owner: ghOwner.trim(), repo: ghRepo.trim() });
      setGhMsg({ success: true, text: 'Настройки GitHub сохранены в оффлайн-режиме' });
      setGhTesting(false);
      return;
    }

    const res = await verifyGitHubToken(token);
    setGhTesting(false);

    if (res.valid) {
      updateSettings({
        token,
        owner: ghOwner.trim() || res.user.login,
        repo: ghRepo.trim(),
      });
      setGhMsg({ success: true, text: `Авторизован: @${res.user.login}. Сохранено!` });
    } else {
      setGhMsg({ success: false, text: res.error || 'Неверный токен GitHub' });
    }
  };

  const handlePushGitHub = async () => {
    setGhMsg(null);
    const res = await pushToGitHub('Manual sync from web interface');
    if (res.success) {
      setGhMsg({ success: true, text: 'Данные успешно закоммичены в репозиторий GitHub!' });
    } else {
      setGhMsg({ success: false, text: res.error || 'Ошибка отправки в GitHub' });
    }
  };

  const handlePullGitHub = async () => {
    if (!window.confirm('Загрузить данные из GitHub? Локальные данные будут перезаписаны версией из репозитория.')) return;
    setGhMsg(null);
    const res = await pullFromGitHub();
    if (res.success) {
      setGhMsg({ success: true, text: 'Данные успешно загружены из репозитория GitHub!' });
    } else {
      setGhMsg({ success: false, text: res.error || 'Ошибка загрузки из GitHub' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Supabase Cloud Section */}
      <div className="surface-card rounded-xl border border-white/5 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
                <span>Supabase Cloud PostgreSQL (24/7 Без сервера)</span>
                <Badge
                  variant={supabaseStatus === 'synced' ? 'emerald' : supabaseStatus === 'syncing' ? 'blue' : 'slate'}
                  size="sm"
                >
                  {supabaseStatus === 'synced' ? 'Синхронизировано' : supabaseStatus === 'syncing' ? 'Синхронизация...' : 'Ожидание'}
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Облачная база данных PostgreSQL с прямым доступом из браузера
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveSupabase} className="space-y-3 max-w-xl">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Supabase Project URL</label>
            <input
              type="text"
              placeholder="https://yourproject.supabase.co"
              value={sbUrl}
              onChange={(e) => setSbUrl(e.target.value)}
              className="w-full h-9 px-3 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Supabase API Key (anon/public)</label>
            <input
              type="password"
              placeholder="eyJhbGciOi..."
              value={sbKey}
              onChange={(e) => setSbKey(e.target.value)}
              className="w-full h-9 px-3 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={sbTesting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {sbTesting ? 'Проверка...' : 'Проверить и сохранить'}
            </button>
            <button
              type="button"
              onClick={handleSyncSupabase}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Выгрузить в облако</span>
            </button>
            <button
              type="button"
              onClick={handlePullSupabase}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Загрузить из облака</span>
            </button>
          </div>
        </form>

        {sbMsg && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
              sbMsg.success
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}
          >
            {sbMsg.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{sbMsg.text}</span>
          </div>
        )}
      </div>

      {/* GitHub Sync Section */}
      <div className="surface-card rounded-xl border border-white/5 p-4 sm:p-5 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <span>GitHub Репозиторий (GitHub Pages)</span>
              <Badge
                variant={syncStatus === 'synced' ? 'emerald' : syncStatus === 'syncing' ? 'blue' : 'slate'}
                size="sm"
              >
                {syncStatus === 'synced' ? 'Синхронизировано' : syncStatus === 'syncing' ? 'Коммит...' : 'Оффлайн'}
              </Badge>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Хранение резервной копии в JSON-файле вашего репозитория
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveGitHub} className="space-y-3 max-w-xl">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Personal Access Token (classic: repo)
            </label>
            <input
              type="password"
              placeholder="ghp_..."
              value={ghToken}
              onChange={(e) => setGhToken(e.target.value)}
              className="w-full h-9 px-3 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Владелец (Owner)</label>
              <input
                type="text"
                value={ghOwner}
                onChange={(e) => setGhOwner(e.target.value)}
                className="w-full h-9 px-3 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Репозиторий (Repo)</label>
              <input
                type="text"
                value={ghRepo}
                onChange={(e) => setGhRepo(e.target.value)}
                className="w-full h-9 px-3 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={ghTesting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {ghTesting ? 'Проверка...' : 'Сохранить настройки GitHub'}
            </button>
            <button
              type="button"
              onClick={handlePushGitHub}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Отправить в GitHub</span>
            </button>
            <button
              type="button"
              onClick={handlePullGitHub}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Загрузить из GitHub</span>
            </button>
          </div>
        </form>

        {ghMsg && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
              ghMsg.success
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}
          >
            {ghMsg.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{ghMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}

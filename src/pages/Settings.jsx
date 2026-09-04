import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Database,
  Cloud,
  Smartphone,
  GitBranch, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Server,
  Key,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { verifyGitHubToken } from '../services/githubApi';
import { testSupabase } from '../services/supabase';

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
    importJsonBackup,
    // 2FA / TOTP
    isTotpEnabled,
    getTotpSetupData,
    enableTotp,
    disableTotp,
    // PostgreSQL FastAPI
    backendUrl,
    updateBackendUrl,
    backendHealth,
    backendLoading,
    checkBackend,
    syncToPostgres,
    pullFromPostgres,
    // Supabase Cloud PostgreSQL
    supabaseConfig,
    updateSupabase,
    syncToSupabase,
    pullFromSupabase,
    supabaseStatus
  } = useData();

  // GitHub Settings state
  const [tokenInput, setTokenInput] = useState(settings.token || '');
  const [ownerInput, setOwnerInput] = useState(settings.owner || 'tigarden');
  const [repoInput, setRepoInput] = useState(settings.repo || 'wq1ewdb-hnajskdfbn-qwe');
  const [isVerifyingGithub, setIsVerifyingGithub] = useState(false);
  const [githubVerifyMsg, setGithubVerifyMsg] = useState(null);

  // Supabase Cloud PostgreSQL state
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfig.key || '');
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseMsg, setSupabaseMsg] = useState(null);
  const [showSupabaseSql, setShowSupabaseSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Self-hosted API state
  const [apiUrlInput, setApiUrlInput] = useState(backendUrl || '');
  const [showSelfHosted, setShowSelfHosted] = useState(false);
  const [dbSyncMsg, setDbSyncMsg] = useState(null);

  // TOTP 2FA state
  const [setupData, setSetupData] = useState(null);
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [totpMsg, setTotpMsg] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // --- GitHub Handlers ---
  const handleSaveGitHubConfig = async (e) => {
    e.preventDefault();
    setIsVerifyingGithub(true);
    setGithubVerifyMsg(null);

    const token = tokenInput.trim();
    if (!token) {
      updateSettings({ token: '', owner: ownerInput.trim(), repo: repoInput.trim() });
      setGithubVerifyMsg({ success: true, text: 'Настройки сохранены в режиме оффлайн (без токена).' });
      setIsVerifyingGithub(false);
      return;
    }

    const res = await verifyGitHubToken(token);
    setIsVerifyingGithub(false);

    if (res.valid) {
      updateSettings({
        token,
        owner: ownerInput.trim() || res.user.login,
        repo: repoInput.trim(),
      });
      setGithubVerifyMsg({
        success: true,
        text: `Успешно авторизован пользователь: @${res.user.login}! Настройки сохранены.`,
      });
    } else {
      setGithubVerifyMsg({
        success: false,
        text: `Ошибка проверки токена: ${res.error}`,
      });
    }
  };

  // --- Supabase Handlers ---
  const handleSaveSupabase = async (e) => {
    e.preventDefault();
    setSupabaseTesting(true);
    setSupabaseMsg(null);

    const url = supabaseUrlInput.trim();
    const key = supabaseKeyInput.trim();

    if (!url || !key) {
      updateSupabase('', '');
      setSupabaseMsg({ success: true, text: 'Настройки Supabase очищены.' });
      setSupabaseTesting(false);
      return;
    }

    const testRes = await testSupabase(url, key);
    setSupabaseTesting(false);

    if (testRes.success) {
      updateSupabase(url, key);
      setSupabaseMsg({ success: true, text: 'Подключение к облачному PostgreSQL (Supabase) успешно установлено!' });
    } else {
      setSupabaseMsg({ success: false, text: `Ошибка подключения: ${testRes.error}. Проверьте URL и ключ anon.` });
    }
  };

  const handleSupabaseSync = async () => {
    setSupabaseMsg(null);
    const res = await syncToSupabase();
    if (res.success) {
      setSupabaseMsg({ success: true, text: 'Данные успешно синхронизированы с облачной базой Supabase!' });
    } else {
      setSupabaseMsg({ success: false, text: `Ошибка синхронизации: ${res.error}` });
    }
  };

  const handleSupabasePull = async () => {
    setSupabaseMsg(null);
    const res = await pullFromSupabase();
    if (res.success) {
      setSupabaseMsg({ success: true, text: 'Данные успешно загружены из облачной базы Supabase!' });
    } else {
      setSupabaseMsg({ success: false, text: `Ошибка загрузки: ${res.error}` });
    }
  };

  const copySqlCode = () => {
    const sql = `CREATE TABLE IF NOT EXISTS debet_data (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE debet_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read/write" ON debet_data FOR ALL TO anon USING (true) WITH CHECK (true);`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // --- TOTP 2FA Handlers ---
  const handleStartTotpSetup = () => {
    const data = getTotpSetupData();
    setSetupData(data);
    setTotpMsg(null);
    setTotpVerifyCode('');
  };

  const handleCopyKey = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleConfirmTotp = async (e) => {
    e.preventDefault();
    if (!setupData?.secret || !totpVerifyCode) return;
    const res = await enableTotp(setupData.secret, totpVerifyCode.trim());
    if (res.success) {
      setTotpMsg({ success: true, text: 'Google Authenticator успешно активирован! Запрос кода будет производиться 1 раз в неделю.' });
      setSetupData(null);
    } else {
      setTotpMsg({ success: false, text: res.error || 'Неверный проверочный код' });
    }
  };

  const handleDisableTotp = () => {
    if (!confirm('Вы уверены, что хотите отключить Google Authenticator? Доступ будет осуществляться по обычному паролю.')) return;
    disableTotp();
    setTotpMsg({ success: true, text: 'Google Authenticator отключен.' });
    setSetupData(null);
  };

  // --- File Backup Handler ---
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
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="surface-card rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-white/10">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">
            Синхронизация и безопасность
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Облачный PostgreSQL (Supabase 24/7), двухфакторная защита 2FA, GitHub репозиторий и локальные бэкапы
          </p>
        </div>
      </div>

      {/* SECTION 1: Google Authenticator 2FA */}
      <div className="surface-card rounded-lg p-4 sm:p-5 space-y-4 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-slate-100">
                  Google Authenticator (2FA)
                </h2>
                {isTotpEnabled ? (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                    ● Активен
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-white/5 text-slate-400 border border-white/10 rounded-md">
                    Не настроен
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Запрос 6-значного кода 1 раз в 7 дней при входе в систему
              </p>
            </div>
          </div>

          <div>
            {isTotpEnabled ? (
              <button
                onClick={handleDisableTotp}
                className="btn-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
              >
                Отключить 2FA
              </button>
            ) : !setupData && (
              <button
                onClick={handleStartTotpSetup}
                className="btn-sm bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Подключить 2FA</span>
              </button>
            )}
          </div>
        </div>

        {totpMsg && (
          <div className={`p-3 rounded-md border text-xs font-medium ${
            totpMsg.success
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            {totpMsg.text}
          </div>
        )}

        {/* Setup Wizard */}
        {setupData && !isTotpEnabled && (
          <div className="surface-elevated rounded-md border border-indigo-500/30 p-4 space-y-4 animate-in fade-in">
            <h3 className="text-xs font-semibold text-slate-200">
              Пошаговое подключение Google Authenticator:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-md space-y-1.5 w-fit mx-auto md:mx-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(setupData.otpauthUrl)}`}
                  alt="QR Code Google Authenticator"
                  className="w-36 h-36"
                />
                <span className="text-[10px] text-slate-700 font-medium">Сканируйте камерой</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Откройте Google Authenticator.</li>
                  <li>Нажмите «+» &rarr; «Сканировать QR-код».</li>
                  <li>Или введите ключ вручную:</li>
                </ol>

                <div className="p-2.5 bg-slate-950 border border-white/10 rounded-md space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Секретный ключ:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-indigo-300 font-bold tracking-wider break-all select-all">
                      {setupData.secret}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="ml-2 p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                      title="Скопировать ключ"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleConfirmTotp} className="pt-1 space-y-2">
                  <label className="block text-[11px] font-medium text-slate-300">
                    Введите 6-значный код для подтверждения:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      value={totpVerifyCode}
                      onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ''))}
                      className="input-md w-32 text-center tracking-widest text-base font-mono font-bold"
                    />
                    <button
                      type="submit"
                      disabled={totpVerifyCode.length !== 6}
                      className="btn-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium"
                    >
                      Активировать
                    </button>
                    <button
                      type="button"
                      onClick={() => setSetupData(null)}
                      className="btn-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="surface-elevated rounded-md p-2.5 flex items-center space-x-2 text-xs text-slate-400 border border-white/5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            Сессия действует ровно <strong className="text-slate-200">7 дней</strong>. В течение недели приложение открывается моментально, а через 7 дней запросит новый код.
          </span>
        </div>
      </div>

      {/* SECTION 2: Supabase Cloud PostgreSQL */}
      <div className="surface-card rounded-lg p-4 sm:p-5 space-y-4 border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-slate-100">
                Облачный PostgreSQL (Supabase)
              </h2>
              {supabaseConfig.url ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  ● Подключено (24/7)
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-mono bg-white/5 text-slate-400 border border-white/10 rounded-md">
                  Не настроен
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Круглосуточная база PostgreSQL в облаке — сохранение и синхронизация между всеми устройствами
            </p>
          </div>
        </div>

        {supabaseMsg && (
          <div className={`p-3 rounded-md border text-xs font-medium ${
            supabaseMsg.success
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            {supabaseMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveSupabase} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrlInput}
                onChange={(e) => setSupabaseUrlInput(e.target.value)}
                placeholder="https://abcdefghijkl.supabase.co"
                className="input-md font-mono text-xs w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Supabase API Key (anon public)
              </label>
              <input
                type="password"
                value={supabaseKeyInput}
                onChange={(e) => setSupabaseKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="input-md font-mono text-xs w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={supabaseTesting}
                className="btn-sm bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50"
              >
                {supabaseTesting ? 'Проверка...' : 'Сохранить и подключить'}
              </button>
              {supabaseConfig.url && (
                <>
                  <button
                    type="button"
                    onClick={handleSupabaseSync}
                    className="btn-sm bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
                  >
                    Отправить в базу
                  </button>
                  <button
                    type="button"
                    onClick={handleSupabasePull}
                    className="btn-sm bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
                  >
                    Загрузить из базы
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowSupabaseSql(!showSupabaseSql)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>{showSupabaseSql ? 'Скрыть SQL-код' : 'Создать таблицу в Supabase (SQL)'}</span>
            </button>
          </div>
        </form>

        {showSupabaseSql && (
          <div className="surface-elevated rounded-md border border-white/10 p-3 space-y-2 text-xs text-slate-300 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-[11px]">Выполните в Supabase &rarr; SQL Editor:</span>
              <button
                type="button"
                onClick={copySqlCode}
                className="btn-sm bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-[11px] flex items-center space-x-1"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Скопировано' : 'Скопировать SQL'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-950 border border-white/5 rounded overflow-x-auto text-[11px] font-mono text-emerald-300">
{`CREATE TABLE IF NOT EXISTS debet_data (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE debet_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read/write" ON debet_data FOR ALL TO anon USING (true) WITH CHECK (true);`}
            </pre>
          </div>
        )}
      </div>

      {/* SECTION 3: GitHub Storage */}
      <div className="surface-card rounded-lg p-4 sm:p-5 space-y-4 border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-slate-100">
                Хранилище в GitHub
              </h2>
              {settings.token ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  ● Активно
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                  Локальный режим
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Синхронизация данных в защищенный репозиторий <strong className="text-slate-300 font-mono">tigarden</strong> с AES-256 шифрованием
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="surface-elevated rounded-md border border-white/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              syncStatus === 'synced' ? 'bg-emerald-500 shadow-sm shadow-emerald-500' :
              syncStatus === 'unsaved' ? 'bg-amber-400 animate-pulse' :
              syncStatus === 'syncing' ? 'bg-blue-400 animate-spin' : 'bg-slate-600'
            }`} />
            <div>
              <span className="text-xs font-medium text-slate-200">
                {syncStatus === 'synced' ? 'Синхронизировано с GitHub' :
                 syncStatus === 'unsaved' ? 'Есть локальные изменения (требуется отправка)' :
                 syncStatus === 'syncing' ? 'Выполняется синхронизация...' :
                 syncStatus === 'no_token' ? 'Токен не указан (только локально)' : 'Ошибка синхронизации'}
              </span>
              {lastSyncTime && (
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Последний обмен: {new Date(lastSyncTime).toLocaleString('ru-RU')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => pushToGitHub()}
              className="btn-sm bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              Отправить в GitHub
            </button>
            <button
              onClick={() => pullFromGitHub()}
              className="btn-sm bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium"
            >
              Загрузить
            </button>
          </div>
        </div>

        {githubVerifyMsg && (
          <div className={`p-3 rounded-md border text-xs font-medium ${
            githubVerifyMsg.success
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            {githubVerifyMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveGitHubConfig} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Персональный токен GitHub (Personal Access Token)
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx..."
              className="input-md font-mono text-xs w-full"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifyingGithub}
            className="btn-md bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium disabled:opacity-50"
          >
            {isVerifyingGithub ? 'Проверка...' : 'Сохранить токен'}
          </button>
        </form>
      </div>

      {/* SECTION 4: Self-Hosted FastAPI */}
      <div className="surface-card rounded-lg p-4 sm:p-5 space-y-3 border border-white/10">
        <button
          type="button"
          onClick={() => setShowSelfHosted(!showSelfHosted)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-slate-100">
                  Собственный сервер API (FastAPI / VPS)
                </h2>
                {backendHealth?.status === 'online' && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                    ● Онлайн
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Опциональное подключение к локальному серверу FastAPI или внешнему VPS
              </p>
            </div>
          </div>
          {showSelfHosted ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showSelfHosted && (
          <div className="pt-3 border-t border-white/10 space-y-3 animate-in fade-in">
            <div className="flex space-x-2">
              <input
                type="text"
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
                placeholder="https://your-server.onrender.com/api"
                className="input-md flex-1 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  updateBackendUrl(apiUrlInput.trim());
                  alert('URL API сохранен.');
                }}
                className="btn-md bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 font-medium shrink-0"
              >
                Сохранить
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Если у вас нет отдельного сервера, оставьте поле пустым — приложение работает через бесплатное облако Supabase или GitHub API.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 5: Export & Backups */}
      <div className="surface-card rounded-lg p-4 sm:p-5 space-y-4 border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Экспорт и локальные бэкапы
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Выгрузка полной бухгалтерии в Excel или резервный зашифрованный JSON-файл
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={exportToExcel}
            className="surface-elevated hover:bg-white/10 border border-white/10 rounded-md p-3 text-xs font-medium text-slate-200 flex items-center justify-center space-x-2 transition-colors group"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-105 transition-transform" />
            <span>Выгрузить Excel (.xlsx)</span>
          </button>

          <button
            onClick={exportJsonBackup}
            className="surface-elevated hover:bg-white/10 border border-white/10 rounded-md p-3 text-xs font-medium text-slate-200 flex items-center justify-center space-x-2 transition-colors group"
          >
            <Download className="w-4 h-4 text-blue-400 group-hover:scale-105 transition-transform" />
            <span>Скачать JSON бэкап</span>
          </button>

          <label className="surface-elevated hover:bg-white/10 border border-white/10 rounded-md p-3 text-xs font-medium text-slate-200 flex items-center justify-center space-x-2 transition-colors cursor-pointer group">
            <Upload className="w-4 h-4 text-amber-400 group-hover:scale-105 transition-transform" />
            <span>Восстановить из JSON</span>
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


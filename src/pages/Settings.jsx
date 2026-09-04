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
  Server
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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Синхронизация и безопасность
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Настройка облачного хранения данных без необходимости держать включенным компьютер, двухфакторная защита 2FA и бэкапы
        </p>
      </div>

      {/* SECTION 1: Google Authenticator 2FA (Раз в неделю) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Google Authenticator (2FA)</span>
                {isTotpEnabled ? (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    Подключен (активен)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 rounded-full">
                    Не настроен
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Запрос 6-значного одноразового кода <strong>1 раз в неделю (сессия 7 дней)</strong> при входе в систему
              </p>
            </div>
          </div>

          <div>
            {isTotpEnabled ? (
              <button
                onClick={handleDisableTotp}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-all"
              >
                Отключить 2FA
              </button>
            ) : !setupData && (
              <button
                onClick={handleStartTotpSetup}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
              >
                <Smartphone className="w-4 h-4" />
                <span>Подключить приложение</span>
              </button>
            )}
          </div>
        </div>

        {totpMsg && (
          <div className={`p-3 rounded-xl border text-xs font-medium ${
            totpMsg.success
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            {totpMsg.text}
          </div>
        )}

        {/* Setup Wizard */}
        {setupData && !isTotpEnabled && (
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">
              Пошаговое подключение Google Authenticator:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md space-y-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setupData.otpauthUrl)}`}
                  alt="QR Code Google Authenticator"
                  className="w-44 h-44"
                />
                <span className="text-[11px] text-slate-600 font-medium">Отсканируйте камерой телефона</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Откройте приложение <strong>Google Authenticator</strong> на смартфоне.</li>
                  <li>Нажмите <strong>«+»</strong> внизу экрана и выберите <strong>«Сканировать QR-код»</strong>.</li>
                  <li>Или введите ключ вручную:</li>
                </ol>

                <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Секретный ключ:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-indigo-300 font-bold tracking-wider break-all select-all">
                      {setupData.secret}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="ml-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Скопировать ключ"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleConfirmTotp} className="pt-2 space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Введите 6-значный код из приложения для подтверждения:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      value={totpVerifyCode}
                      onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ''))}
                      className="w-36 text-center tracking-widest text-lg py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={totpVerifyCode.length !== 6}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                    >
                      Активировать 2FA
                    </button>
                    <button
                      type="button"
                      onClick={() => setSetupData(null)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-xl"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center space-x-2.5 text-xs text-slate-400">
          <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            При авторизации через Google Authenticator сессия действует ровно <strong>7 дней</strong>. В течение недели приложение открывается мгновенно, а через 7 дней запросит новый код.
          </span>
        </div>
      </div>

      {/* SECTION 2: Облачный PostgreSQL через Supabase (24/7 без ПК) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Облачный PostgreSQL (Supabase)</span>
              {supabaseConfig.url ? (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Подключено (Облако 24/7)
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 rounded-full">
                  Не настроен
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Полноценная база данных PostgreSQL в бесплатном облаке — работает круглосуточно с любого телефона или компьютера
            </p>
          </div>
        </div>

        {supabaseMsg && (
          <div className={`p-3 rounded-xl border text-xs font-medium ${
            supabaseMsg.success
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            {supabaseMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrlInput}
                onChange={(e) => setSupabaseUrlInput(e.target.value)}
                placeholder="https://abcdefghijkl.supabase.co"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Supabase API Key (anon public)
              </label>
              <input
                type="password"
                value={supabaseKeyInput}
                onChange={(e) => setSupabaseKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={supabaseTesting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {supabaseTesting ? 'Проверка...' : 'Сохранить и подключить'}
              </button>
              {supabaseConfig.url && (
                <>
                  <button
                    type="button"
                    onClick={handleSupabaseSync}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    Отправить данные в Supabase
                  </button>
                  <button
                    type="button"
                    onClick={handleSupabasePull}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    Загрузить из Supabase
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowSupabaseSql(!showSupabaseSql)}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline flex items-center space-x-1"
            >
              <span>{showSupabaseSql ? 'Скрыть SQL-инструкцию' : 'Как создать таблицу в Supabase (1 клик)'}</span>
            </button>
          </div>
        </form>

        {showSupabaseSql && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Выполните в Supabase &rarr; SQL Editor:</span>
              <button
                type="button"
                onClick={copySqlCode}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center space-x-1"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Скопировано' : 'Скопировать SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded-lg overflow-x-auto text-[11px] font-mono text-emerald-300">
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

      {/* SECTION 3: Облачное хранилище GitHub (Работает прямо сейчас!) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Хранилище в GitHub (Работает без компьютера 24/7)</span>
              {settings.token ? (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Активно
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  Локальный режим (введите токен для синхронизации)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Сохранение данных прямо в репозиторий под учетной записью <strong className="text-slate-300">tigarden</strong> с шифрованием AES-256
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
                 syncStatus === 'no_token' ? 'Токен не указан (работает в браузере)' : 'Ошибка синхронизации'}
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
              Загрузить
            </button>
          </div>
        </div>

        {githubVerifyMsg && (
          <div className={`p-3 rounded-xl border text-xs font-medium ${
            githubVerifyMsg.success
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            {githubVerifyMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveGitHubConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Персональный токен GitHub (Personal Access Token)
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifyingGithub}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
          >
            {isVerifyingGithub ? 'Проверка...' : 'Сохранить токен'}
          </button>
        </form>
      </div>

      {/* SECTION 4: Собственный сервер API / FastAPI (Опционально) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <button
          type="button"
          onClick={() => setShowSelfHosted(!showSelfHosted)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Собственный сервер API (FastAPI / Render / VPS)</span>
                {backendHealth?.status === 'online' && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    Подключен
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Для тех, кто развернул бэкенд на отдельном сервере или запускает локально на ПК
              </p>
            </div>
          </div>
          {showSelfHosted ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showSelfHosted && (
          <div className="pt-4 border-t border-slate-800 space-y-4 animate-in fade-in">
            <div className="flex space-x-2">
              <input
                type="text"
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
                placeholder="https://your-server.onrender.com/api"
                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  updateBackendUrl(apiUrlInput.trim());
                  alert('URL API сохранен.');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Сохранить
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Если у вас нет отдельного сервера, оставьте поле пустым — приложение на GitHub Pages будет работать через бесплатное облако Supabase или GitHub API.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 5: Export & Backups */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Экспорт и локальные бэкапы
            </h2>
            <p className="text-xs text-slate-400">
              Выгрузка полной бухгалтерии в Excel или резервный JSON-файл
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center space-x-2 p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Выгрузить Excel (.xlsx)</span>
          </button>

          <button
            onClick={exportJsonBackup}
            className="flex items-center justify-center space-x-2 p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Скачать JSON бэкап</span>
          </button>

          <label className="flex items-center justify-center space-x-2 p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-amber-400" />
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

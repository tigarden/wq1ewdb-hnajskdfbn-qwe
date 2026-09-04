import React, { useState } from 'react';
import {
  Smartphone,
  Key,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Copy,
  Check,
  Calendar,
  Eye,
  EyeOff,
  Fingerprint,
  Trash2,
  Plus,
  Sparkles,
  Info,
} from 'lucide-react';
import Badge from '../Badge';
import ConfirmModal from '../ConfirmModal';

export default function SecuritySettings({
  isTotpEnabled,
  getTotpSetupData,
  enableTotp,
  disableTotp,
  changeMasterPassword,
  lockApp,
  passkeys = [],
  isPasskeyAvailable,
  registerPasskey,
  deletePasskey,
}) {
  // Passkey state
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyMsg, setPasskeyMsg] = useState(null);
  const [passkeyToDelete, setPasskeyToDelete] = useState(null);

  // TOTP Setup state
  const [setupData, setSetupData] = useState(null);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [totpMsg, setTotpMsg] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [totpLoading, setTotpLoading] = useState(false);

  // Password change state
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passMsg, setPassMsg] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  // Register Passkey
  const handleCreatePasskey = async () => {
    setPasskeyMsg(null);
    setPasskeyLoading(true);
    try {
      const res = await registerPasskey('admin@debet.auto');
      if (res.success) {
        setPasskeyMsg({
          success: true,
          text: `Ключ доступа «${res.credential.label}» успешно привязан к устройству!`,
        });
      } else {
        setPasskeyMsg({ success: false, text: res.error || 'Ошибка при создании ключа доступа' });
      }
    } catch (err) {
      setPasskeyMsg({ success: false, text: err.message || 'Ошибка создания ключа' });
    } finally {
      setPasskeyLoading(false);
    }
  };

  // Start TOTP Setup
  const handleStartTotpSetup = () => {
    const data = getTotpSetupData();
    setSetupData(data);
    setTotpVerifyCode('');
    setTotpMsg(null);
  };

  // Confirm and Enable TOTP
  const handleEnableTotp = async (e) => {
    e.preventDefault();
    if (!totpVerifyCode || totpVerifyCode.trim().length !== 6) {
      setTotpMsg({ success: false, text: 'Введите 6-значный код из приложения' });
      return;
    }

    setTotpLoading(true);
    setTotpMsg(null);

    const res = await enableTotp(setupData.secret, totpVerifyCode.trim());
    setTotpLoading(false);

    if (res.success) {
      setTotpMsg({ success: true, text: 'Google Authenticator (2FA) успешно активирован!' });
      setSetupData(null);
    } else {
      setTotpMsg({ success: false, text: res.error || 'Неверный код подтверждения' });
    }
  };

  // Disable TOTP
  const handleDisableTotp = () => {
    setIsDisableModalOpen(true);
  };

  // Copy secret key
  const handleCopyKey = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Change Master Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg(null);

    if (!oldPass) {
      setPassMsg({ success: false, text: 'Введите текущий мастер-пароль' });
      return;
    }
    if (newPass.length < 4) {
      setPassMsg({ success: false, text: 'Новый пароль должен содержать от 4 символов' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ success: false, text: 'Новый пароль и повтор не совпадают' });
      return;
    }

    setPassLoading(true);
    const res = await changeMasterPassword(oldPass, newPass);
    setPassLoading(false);

    if (res.success) {
      setPassMsg({ success: true, text: 'Мастер-пароль успешно изменен и зашифрован!' });
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassMsg({ success: false, text: res.error || 'Ошибка смены пароля' });
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Passkey / Apple Face ID & Touch ID Section */}
      <div className="surface-card rounded-xl border border-white/5 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Fingerprint className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
                <span>Ключи доступа Passkey (Apple Face ID / Touch ID)</span>
                <Badge variant={passkeys.length > 0 ? 'emerald' : 'slate'} size="sm">
                  {passkeys.length > 0 ? `${passkeys.length} привязано` : 'Не настроено'}
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Биометрический вход в один клик через Face ID, Touch ID на iPhone/Mac или Windows Hello
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCreatePasskey}
              disabled={passkeyLoading}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium transition-all flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{passkeyLoading ? 'Создание...' : 'Создать ключ доступа'}</span>
            </button>
          </div>
        </div>

        {/* List of registered Passkeys */}
        {passkeys.length > 0 ? (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-slate-300">Привязанные ключи на устройствах:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {passkeys.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/10"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{p.label}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('ru-RU') : 'Активен'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasskeyToDelete(p)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Удалить ключ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex items-start space-x-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Нажмите <b>«Создать ключ доступа»</b>, чтобы сохранить Passkey в связке ключей Apple iCloud Keychain или Windows Hello. Это позволит моментально разблокировать приложение по взгляду или отпечатку пальца без ввода пароля.
            </span>
          </div>
        )}

        {passkeyMsg && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
              passkeyMsg.success
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}
          >
            {passkeyMsg.success ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{passkeyMsg.text}</span>
          </div>
        )}
      </div>

      {/* 2. 2FA Google Authenticator Section */}
      <div className="surface-card rounded-xl border border-white/5 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
                <span>Google Authenticator (2FA)</span>
                <Badge variant={isTotpEnabled ? 'emerald' : 'slate'} size="sm">
                  {isTotpEnabled ? 'Активна' : 'Не подключена'}
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                При включении вход строго требует мастер-пароль <b>И</b> 6-значный код Authenticator
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isTotpEnabled ? (
              <button
                type="button"
                onClick={handleDisableTotp}
                className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-950/30 text-xs font-medium transition-colors cursor-pointer"
              >
                Отключить 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartTotpSetup}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Подключить приложение
              </button>
            )}
          </div>
        </div>

        {/* Setup Drawer if active */}
        {setupData && !isTotpEnabled && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-3.5 animate-in fade-in">
            <div className="text-xs font-medium text-slate-200">
              Шаги подключения в приложении Google Authenticator:
            </div>

            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>Откройте Google Authenticator на смартфоне и нажмите значок <b>«+»</b>.</li>
              <li>Выберите <b>«Ввести ключ настройки»</b>.</li>
              <li>
                Укажите аккаунт: <code className="text-blue-400">Debet.auto</code> и вставьте секретный ключ:
              </li>
            </ol>

            {/* Secret key box */}
            <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-xs text-amber-300 justify-between">
              <span className="tracking-wider break-all">{setupData.secret}</span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 transition-colors cursor-pointer"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Скопировано' : 'Копировать'}</span>
              </button>
            </div>

            {/* Verify Form */}
            <form onSubmit={handleEnableTotp} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-значный код"
                value={totpVerifyCode}
                onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ''))}
                className="w-full sm:w-48 h-9 px-3 bg-slate-950 border border-white/15 rounded-lg text-center font-mono font-bold text-sm tracking-widest text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={totpLoading}
                className="w-full sm:w-auto h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {totpLoading ? 'Проверка...' : 'Активировать 2FA'}
              </button>
              <button
                type="button"
                onClick={() => setSetupData(null)}
                className="w-full sm:w-auto h-9 px-3 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Отмена
              </button>
            </form>
          </div>
        )}

        {totpMsg && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
              totpMsg.success
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}
          >
            {totpMsg.success ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{totpMsg.text}</span>
          </div>
        )}
      </div>

      {/* 3. Change Master Password Section */}
      <div className="surface-card rounded-xl border border-white/5 p-4 sm:p-5 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Мастер-пароль доступа</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Хешируется с помощью Web Crypto PBKDF2 (SHA-256). Пароль не хранится в открытом виде.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Текущий мастер-пароль
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                placeholder="Текущий пароль..."
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full h-9 pl-3 pr-9 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Новый пароль
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                placeholder="От 4 знаков..."
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full h-9 px-3 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Повтор пароля
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                placeholder="Повторите..."
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full h-9 px-3 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {passMsg && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
                passMsg.success
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
              }`}
            >
              {passMsg.success ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{passMsg.text}</span>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={passLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {passLoading ? 'Сохранение...' : 'Обновить мастер-пароль'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Session Management */}
      <div className="surface-card rounded-xl border border-white/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Текущая сессия</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Авторизация действительна 7 дней на этом устройстве
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={lockApp}
          className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-white/5 text-xs font-medium transition-colors cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Заблокировать сейчас</span>
        </button>
      </div>

      {/* Modal: Confirm Disable 2FA */}
      <ConfirmModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        onConfirm={async () => {
          setIsDisableModalOpen(false);
          await disableTotp();
          setSetupData(null);
          setTotpMsg({ success: true, text: '2FA Google Authenticator отключена' });
        }}
        title="Отключить 2FA защиту"
        message="Вы уверены, что хотите отключить двухфакторную аутентификацию? Защита приложения будет снижена до обычного мастер-пароля."
        confirmText="Отключить 2FA"
        variant="warning"
      />

      {/* Modal: Confirm Delete Passkey */}
      <ConfirmModal
        isOpen={Boolean(passkeyToDelete)}
        onClose={() => setPasskeyToDelete(null)}
        onConfirm={async () => {
          if (passkeyToDelete) {
            await deletePasskey(passkeyToDelete.id);
            setPasskeyToDelete(null);
            setPasskeyMsg({ success: true, text: 'Ключ доступа удален' });
          }
        }}
        title="Удалить ключ доступа"
        message={`Удалить ключ «${passkeyToDelete?.label}»? Вы больше не сможете использовать биометрию этого устройства для быстрого входа.`}
        confirmText="Удалить ключ"
        variant="danger"
      />
    </div>
  );
}

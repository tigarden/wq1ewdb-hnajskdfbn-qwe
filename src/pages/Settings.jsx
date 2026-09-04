import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import SecuritySettings from '../components/settings/SecuritySettings';
import CloudSyncSettings from '../components/settings/CloudSyncSettings';
import BackupSettings from '../components/settings/BackupSettings';
import AppSettings from '../components/settings/AppSettings';
import { Shield, Cloud, FileSpreadsheet, Smartphone } from 'lucide-react';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('security'); // 'security' | 'cloud' | 'backup' | 'app'

  const {
    // 2FA & Auth
    isTotpEnabled,
    getTotpSetupData,
    enableTotp,
    disableTotp,
    changeMasterPassword,
    lockApp,
    // Cloud & GitHub
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
    // Backup & Export
    exportToExcel,
    exportJsonBackup,
    importJsonBackup,
  } = useData();

  const sections = [
    { id: 'security', label: 'Безопасность и 2FA', icon: Shield },
    { id: 'cloud', label: 'Облако и GitHub', icon: Cloud },
    { id: 'backup', label: 'Экспорт и Бэкап', icon: FileSpreadsheet },
    { id: 'app', label: 'Приложение на экран', icon: Smartphone },
  ];

  return (
    <div className="space-y-4">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/5 w-fit">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Section Content */}
      <div className="animate-in fade-in duration-150">
        {activeSection === 'security' && (
          <SecuritySettings
            isTotpEnabled={isTotpEnabled}
            getTotpSetupData={getTotpSetupData}
            enableTotp={enableTotp}
            disableTotp={disableTotp}
            changeMasterPassword={changeMasterPassword}
            lockApp={lockApp}
          />
        )}

        {activeSection === 'cloud' && (
          <CloudSyncSettings
            supabaseConfig={supabaseConfig}
            updateSupabase={updateSupabase}
            syncToSupabase={syncToSupabase}
            pullFromSupabase={pullFromSupabase}
            supabaseStatus={supabaseStatus}
            settings={settings}
            updateSettings={updateSettings}
            pushToGitHub={pushToGitHub}
            pullFromGitHub={pullFromGitHub}
            syncStatus={syncStatus}
          />
        )}

        {activeSection === 'backup' && (
          <BackupSettings
            exportToExcel={exportToExcel}
            exportJsonBackup={exportJsonBackup}
            importJsonBackup={importJsonBackup}
          />
        )}

        {activeSection === 'app' && (
          <AppSettings />
        )}
      </div>
    </div>
  );
}

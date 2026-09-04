import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function BackupSettings({
  exportToExcel,
  exportJsonBackup,
  importJsonBackup,
}) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [backupMsg, setBackupMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    setBackupMsg(null);
    try {
      await exportToExcel();
      setBackupMsg({ success: true, text: 'Файл Excel (.xlsx) успешно сгенерирован и скачан!' });
    } catch (err) {
      setBackupMsg({ success: false, text: `Ошибка экспорта в Excel: ${err.message}` });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Восстановить данные из файла "${file.name}"? Текущие записи будут заменены.`)) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const res = importJsonBackup(parsed);
        if (res.success) {
          setBackupMsg({ success: true, text: 'Данные успешно восстановлены из резервной копии!' });
        } else {
          setBackupMsg({ success: false, text: res.error || 'Ошибка формата файла' });
        }
      } catch (err) {
        setBackupMsg({ success: false, text: `Ошибка разбора JSON: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="surface-card rounded-xl border border-white/5 p-4 sm:p-5 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Резервное копирование и экспорт</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Сохранение полной базы в файл Excel (.xlsx) или структуры в JSON
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Export Excel */}
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={isExportingExcel}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 text-center space-y-2 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-slate-200">
              {isExportingExcel ? 'Генерация...' : 'Выгрузка в Excel (.xlsx)'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Клиенты, детали, долги</div>
          </div>
        </button>

        {/* Export JSON */}
        <button
          type="button"
          onClick={exportJsonBackup}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 text-center space-y-2 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-slate-200">Резервная копия JSON</div>
            <div className="text-xs text-slate-400 mt-0.5">Полный бэкап всех таблиц</div>
          </div>
        </button>

        {/* Import JSON */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 text-center space-y-2 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-slate-200">Восстановить из JSON</div>
            <div className="text-xs text-slate-400 mt-0.5">Импорт структуры данных</div>
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJson}
          className="hidden"
        />
      </div>

      {backupMsg && (
        <div
          className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
            backupMsg.success
              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
          }`}
        >
          {backupMsg.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{backupMsg.text}</span>
        </div>
      )}
    </div>
  );
}

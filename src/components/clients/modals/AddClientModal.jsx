import React, { useState } from 'react';
import Modal from '../../Modal';
import { User, Phone, Car, DollarSign, Building2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function AddClientModal({ isOpen, onClose, onAddClient, onSelectClient }) {
  const [clientType, setClientType] = useState('retail'); // 'retail' | 'wholesale'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  const parseMoney = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Пожалуйста, укажите имя или название клиента');
      return;
    }

    const newCli = onAddClient({
      name: name.trim(),
      clientType,
      phone: phone.trim(),
      car: clientType === 'wholesale' ? '' : car.trim(),
      initialBalance: parseMoney(initialBalance),
      notes: notes.trim(),
    });

    if (onSelectClient && newCli?.id) {
      onSelectClient(newCli.id);
    }

    setName('');
    setPhone('');
    setCar('');
    setInitialBalance('');
    setNotes('');
    setError('');
    setShowAdvanced(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новый клиент">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client Type Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-white/10 gap-1">
          <button
            type="button"
            onClick={() => setClientType('retail')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              clientType === 'retail'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Розница (Авто)</span>
          </button>
          <button
            type="button"
            onClick={() => setClientType('wholesale')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              clientType === 'wholesale'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Опт / СТО</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Client Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            {clientType === 'wholesale' ? 'Название СТО / Имя мастера' : 'Имя клиента'} <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              autoFocus
              placeholder={clientType === 'wholesale' ? 'СТО Престиж, Мастер Сергей...' : 'Иван, Александр...'}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Phone and Car (Car conditionally visible only for retail) */}
        <div className={`grid gap-3 ${clientType === 'retail' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Телефон</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+380..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {clientType === 'retail' && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Автомобиль
              </label>
              <div className="relative">
                <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Passat B7, BMW X5..."
                  value={car}
                  onChange={(e) => setCar(e.target.value)}
                  className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {clientType === 'wholesale' && (
          <p className="text-xs text-indigo-300/80 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-lg">
            🏢 Для оптовых клиентов и СТО ввод авто исключен — машина может указываться отдельно под каждую деталь в заказе.
          </p>
        )}

        {/* Collapsible Advanced Section */}
        <div className="border-t border-white/[0.08] pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full py-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span>Дополнительно (начальный баланс, заметки)</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="space-y-3 pt-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Начальный баланс (грн долга)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Положительное число — клиент нам должен. Отрицательное — наш долг клиенту.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Заметки</label>
                <textarea
                  rows={2}
                  placeholder="Дополнительная информация, скидка, адрес доставки..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-md sm:btn-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn-md sm:btn-sm btn-primary font-bold shadow-md shadow-blue-500/25 cursor-pointer"
          >
            ✓ Создать клиента
          </button>
        </div>
      </form>
    </Modal>
  );
}

import React, { useState } from 'react';
import Modal from '../../Modal';
import { User, Phone, Car, DollarSign } from 'lucide-react';

export default function AddClientModal({ isOpen, onClose, onAddClient, onSelectClient }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCli = onAddClient({
      name: name.trim(),
      phone: phone.trim(),
      car: car.trim(),
      initialBalance: parseFloat(initialBalance) || 0,
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
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новый клиент / мастер">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Имя или название <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Например: Тотус или Сергей Мастер"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Телефон</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="+380..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Автомобиль</label>
            <div className="relative">
              <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Passat B7 / Vito"
                value={car}
                onChange={(e) => setCar(e.target.value)}
                className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Начальный баланс (грн долга)
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              step="any"
              placeholder="0 (или предыдущий остаток)"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Положительное число — клиент нам должен. Отрицательное — наш долг клиенту.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Заметки</label>
          <textarea
            rows={2}
            placeholder="Дополнительная информация, адрес доставки..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2.5 pt-3">
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
            Создать клиента
          </button>
        </div>
      </form>
    </Modal>
  );
}

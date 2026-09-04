import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import { User, Phone, Car, DollarSign } from 'lucide-react';

export default function EditClientModal({ isOpen, onClose, client, onUpdateClient }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setPhone(client.phone || '');
      setCar(client.car || '');
      setInitialBalance(client.initialBalance !== undefined ? client.initialBalance.toString() : '0');
      setNotes(client.notes || '');
    }
  }, [client]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!client || !name.trim()) return;

    onUpdateClient(client.id, {
      name: name.trim(),
      phone: phone.trim(),
      car: car.trim(),
      initialBalance: parseFloat(initialBalance) || 0,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Редактировать: ${client?.name || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Имя или название <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Телефон</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Автомобиль</label>
            <div className="relative">
              <Car className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={car}
                onChange={(e) => setCar(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Начальный баланс ($ долга)
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="number"
              step="any"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Заметки</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Сохранить изменения
          </button>
        </div>
      </form>
    </Modal>
  );
}

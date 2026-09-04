import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import { DollarSign, Calendar, FileText } from 'lucide-react';

export default function AddPaymentModal({
  isOpen,
  onClose,
  client,
  onAddTransaction,
}) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!client || !amount) return;

    onAddTransaction({
      clientId: client.id,
      type: 'payment',
      amount: parseFloat(amount) || 0,
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim() || 'Оплата',
    });

    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Внести оплату: ${client?.name || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            Сумма оплаты (грн) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              step="any"
              required
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-emerald-400 font-bold font-mono focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Дата платежа</label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Примечание / Источник
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Наличные, перевод на карту..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
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
            className="btn-md sm:btn-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-md shadow-emerald-500/25 cursor-pointer"
          >
            Внести оплату
          </button>
        </div>
      </form>
    </Modal>
  );
}

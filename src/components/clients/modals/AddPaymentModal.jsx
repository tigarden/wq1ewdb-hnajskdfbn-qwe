import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import { DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function AddPaymentModal({
  isOpen,
  onClose,
  client,
  onAddTransaction,
}) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [isOpen]);

  const parseMoney = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!client) {
      setError('Клиент не выбран');
      return;
    }

    const finalAmount = parseMoney(amount);
    if (finalAmount <= 0) {
      setError('Пожалуйста, укажите сумму оплаты (больше 0)');
      return;
    }

    onAddTransaction({
      clientId: client.id,
      type: 'payment',
      amount: finalAmount,
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim() || 'Оплата',
    });

    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Внести оплату: ${client?.name || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            Сумма оплаты (грн) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              inputMode="decimal"
              required
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-emerald-400 font-bold font-mono focus:outline-hidden focus:border-emerald-500"
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
              className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
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
              className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

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
            className="btn-md sm:btn-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-md shadow-emerald-500/25 cursor-pointer"
          >
            ✓ Внести оплату
          </button>
        </div>
      </form>
    </Modal>
  );
}

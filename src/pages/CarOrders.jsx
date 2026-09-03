import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { 
  Car, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  Package
} from 'lucide-react';

export default function CarOrders({ selectedCarId, onSelectCar }) {
  const { 
    data, 
    addCarOrder, 
    updateCarOrder, 
    deleteCarOrder,
    addCarItem, 
    deleteCarItem,
    addCarPayment, 
    deleteCarPayment,
    getCarOrderStats 
  } = useData();

  const currentCarId = selectedCarId || data.carOrders[0]?.id;
  const currentCar = data.carOrders.find((c) => c.id === currentCarId);
  const currentStats = currentCar ? getCarOrderStats(currentCar.id) : null;

  // Modals
  const [isNewCarModalOpen, setIsNewCarModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  // New Car form
  const [newCarModel, setNewCarModel] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newPlate, setNewPlate] = useState('');

  // Item form
  const [itemName, setItemName] = useState('');
  const [itemArticle, setItemArticle] = useState('');
  const [itemPurchase, setItemPurchase] = useState('');
  const [itemSale, setItemSale] = useState('');
  const [itemSupplierId, setItemSupplierId] = useState('');

  // Payment form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');

  const formatMoney = (val) => {
    return (val || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  };

  const handleCreateCar = (e) => {
    e.preventDefault();
    if (!newCarModel.trim()) return;
    const order = addCarOrder({
      carModel: newCarModel,
      clientName: newClientName,
      licensePlate: newPlate,
    });
    onSelectCar(order.id);
    setNewCarModel('');
    setNewClientName('');
    setNewPlate('');
    setIsNewCarModalOpen(false);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    addCarItem({
      carOrderId: currentCar.id,
      name: itemName,
      article: itemArticle,
      purchasePrice: parseFloat(itemPurchase) || 0,
      salePrice: parseFloat(itemSale) || 0,
      supplierId: itemSupplierId || null,
    });
    setItemName('');
    setItemArticle('');
    setItemPurchase('');
    setItemSale('');
    setIsAddItemModalOpen(false);
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!paymentAmount) return;
    addCarPayment({
      carOrderId: currentCar.id,
      amount: parseFloat(paymentAmount),
      date: paymentDate,
      note: paymentNote,
    });
    setPaymentAmount('');
    setPaymentNote('');
    setIsAddPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Car className="w-5 h-5 text-blue-400" />
            <span>Заказы по авто и клиентам</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Учет деталей, себестоимости, цен продажи и оплат клиентов (как в Лист1)
          </p>
        </div>
        <button
          onClick={() => setIsNewCarModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Новый автомобиль</span>
        </button>
      </div>

      {/* Two Column Layout: Cars List on Left, Active Car Ledger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of Cars */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase text-slate-400 px-1">
            Список автомобилей ({data.carOrders.length})
          </div>

          {data.carOrders.length === 0 ? (
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center text-slate-500 text-sm">
              Пока нет автомобилей. Нажмите «Новый автомобиль», чтобы создать заказ.
            </div>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {data.carOrders.map((car) => {
                const stats = getCarOrderStats(car.id);
                const isSelected = car.id === currentCar?.id;
                return (
                  <div
                    key={car.id}
                    onClick={() => onSelectCar(car.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-950/20'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">
                          {car.carModel}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {car.clientName ? `Клиент: ${car.clientName}` : 'Без имени'}
                          {car.licensePlate ? ` • ${car.licensePlate}` : ''}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        car.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {car.status === 'completed' ? 'Закрыт' : 'В работе'}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Долг клиента:</span>
                      <span className={`font-bold ${
                        (stats?.clientDebt || 0) > 0 ? 'text-purple-400' : 'text-emerald-400'
                      }`}>
                        {formatMoney(stats?.clientDebt || 0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Car Details, Items, and Payments */}
        <div className="lg:col-span-8 space-y-5">
          {currentCar && currentStats ? (
            <>
              {/* Car KPI Card */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <span>{currentCar.carModel}</span>
                      {currentCar.licensePlate && (
                        <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {currentCar.licensePlate}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Клиент: {currentCar.clientName || 'Не указан'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const newStatus = currentCar.status === 'completed' ? 'in_progress' : 'completed';
                        updateCarOrder(currentCar.id, { status: newStatus });
                      }}
                      className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      {currentCar.status === 'completed' ? 'Открыть снова' : 'Закрыть заказ'}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Удалить авто "${currentCar.carModel}"?`)) {
                          deleteCarOrder(currentCar.id);
                        }
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Numbers Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400">Себестоимость</span>
                    <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                      {formatMoney(currentStats.totalPurchase)}
                    </div>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400">Сумма клиенту</span>
                    <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                      {formatMoney(currentStats.totalSale)}
                    </div>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400">Оплачено клиентом</span>
                    <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                      {formatMoney(currentStats.totalPaid)}
                    </div>
                  </div>
                  <div className="bg-purple-950/20 p-3 rounded-xl border border-purple-500/30">
                    <span className="text-[10px] uppercase text-purple-300 font-semibold">Долг клиента</span>
                    <div className="text-sm font-bold font-mono text-purple-400 mt-0.5">
                      {formatMoney(currentStats.clientDebt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Детали и работы ({currentStats.items.length})</span>
                  </h3>
                  <button
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить деталь</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Наименование</th>
                        <th className="py-2.5 px-3">Артикул</th>
                        <th className="py-2.5 px-3 text-right">Закупка (руб)</th>
                        <th className="py-2.5 px-3 text-right">Продажа (руб)</th>
                        <th className="py-2.5 px-3 text-right">Маржа</th>
                        <th className="py-2.5 px-3 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {currentStats.items.map((item) => {
                        const margin = (item.salePrice || 0) - (item.purchasePrice || 0);
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-semibold text-slate-200">
                              {item.name}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-blue-300">
                              {item.article || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                              {formatMoney(item.purchasePrice)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-100 font-bold">
                              {formatMoney(item.salePrice)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                              +{formatMoney(margin)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => deleteCarItem(item.id)}
                                className="p-1 text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {currentStats.items.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-6 text-center text-slate-500">
                            Нет добавленных деталей
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments Section */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Оплаты от клиента ({currentStats.payments.length})</span>
                  </h3>
                  <button
                    onClick={() => setIsAddPaymentModalOpen(true)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Внести оплату</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Дата</th>
                        <th className="py-2.5 px-3">Сумма оплаты</th>
                        <th className="py-2.5 px-3">Примечание</th>
                        <th className="py-2.5 px-3 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {currentStats.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 text-slate-400">
                            {p.date}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                            {formatMoney(p.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {p.note || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => deleteCarPayment(p.id)}
                              className="p-1 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {currentStats.payments.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-slate-500">
                            Оплат от клиента пока не зафиксировано
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/60 p-12 rounded-2xl border border-slate-800 text-center text-slate-500">
              Выберите автомобиль из списка слева или создайте новый
            </div>
          )}
        </div>

      </div>

      {/* Modal: New Car */}
      <Modal isOpen={isNewCarModalOpen} onClose={() => setIsNewCarModalOpen(false)} title="Новый автомобиль">
        <form onSubmit={handleCreateCar} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Марка и модель авто *</label>
            <input
              type="text"
              placeholder="напр. Chery Tiggo 7, Passat B6"
              value={newCarModel}
              onChange={(e) => setNewCarModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Имя владельца</label>
              <input
                type="text"
                placeholder="Иван"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Госномер</label>
              <input
                type="text"
                placeholder="В001ВВ77"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 uppercase"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30"
          >
            Создать автомобиль
          </button>
        </form>
      </Modal>

      {/* Modal: Add Item to Car */}
      <Modal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title="Добавить деталь / работу">
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Наименование детали / работы *</label>
            <input
              type="text"
              placeholder="Сцепление, масло кпп, шаровые..."
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Артикул / Код</label>
              <input
                type="text"
                placeholder="напр. QB 114-0042"
                value={itemArticle}
                onChange={(e) => setItemArticle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Поставщик</label>
              <select
                value={itemSupplierId}
                onChange={(e) => setItemSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              >
                <option value="">(Не указан)</option>
                {data.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Себестоимость (закупка)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={itemPurchase}
                onChange={(e) => setItemPurchase(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono text-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Цена для клиента (продажа)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={itemSale}
                onChange={(e) => setItemSale(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono font-bold text-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
          >
            Сохранить деталь
          </button>
        </form>
      </Modal>

      {/* Modal: Add Payment from Client */}
      <Modal isOpen={isAddPaymentModalOpen} onClose={() => setIsAddPaymentModalOpen(false)} title="Оплата от клиента">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Сумма оплаты *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono font-bold text-emerald-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Дата</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Примечание (аванс, расчет...)</label>
            <input
              type="text"
              placeholder="напр. Наличные при сдаче авто"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all"
          >
            Внести оплату
          </button>
        </form>
      </Modal>

    </div>
  );
}

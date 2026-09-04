import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import ClientList from '../components/clients/ClientList';
import ClientHeader from '../components/clients/ClientHeader';
import ClientLedger from '../components/clients/ClientLedger';
import AddClientModal from '../components/clients/modals/AddClientModal';
import EditClientModal from '../components/clients/modals/EditClientModal';
import AddItemModal from '../components/clients/modals/AddItemModal';
import AddPaymentModal from '../components/clients/modals/AddPaymentModal';
import EmptyState from '../components/EmptyState';
import { ArrowLeft } from 'lucide-react';

export default function Clients({ selectedClientId, onSelectClient }) {
  const {
    data,
    addClient,
    updateClient,
    deleteClient,
    addClientTransaction,
    deleteClientTransaction,
    getClientStats,
    addSupplierToDirectory,
  } = useData();

  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [sortByDebt, setSortByDebt] = useState(true);
  const [mobileShowDetail, setMobileShowDetail] = useState(Boolean(selectedClientId));

  // Modals state
  const [isAddCliModalOpen, setIsAddCliModalOpen] = useState(false);
  const [isEditCliModalOpen, setIsEditCliModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  // Active client selection
  const clients = data.clients || [];
  const currentClientId = selectedClientId || clients[0]?.id;
  const currentClient = clients.find((c) => c.id === currentClientId) || clients[0];
  const stats = currentClient ? getClientStats(currentClient.id) : null;
  const transactions = (data.clientTransactions || []).filter(
    (t) => t.clientId === currentClient?.id
  );

  const handleSelectClient = (id) => {
    if (onSelectClient) {
      onSelectClient(id);
    }
    setMobileShowDetail(true);
  };

  const handleDeleteClient = (id) => {
    deleteClient(id);
    const remaining = clients.filter((c) => c.id !== id);
    if (remaining.length > 0 && onSelectClient) {
      onSelectClient(remaining[0].id);
    }
    setMobileShowDetail(false);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Mobile Back Button when client detail is open */}
      <div className="md:hidden">
        {mobileShowDetail && (
          <button
            type="button"
            onClick={() => setMobileShowDetail(false)}
            className="w-full flex items-center justify-center space-x-2 px-4 h-11 min-h-[44px] rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-blue-400 border border-white/10 font-bold text-sm tracking-wide shadow-sm active:scale-[0.98] transition-all mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад ко всем клиентам</span>
          </button>
        )}
      </div>

      {/* Main Responsive Layout: 2 Columns on Desktop, Toggle on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-12 2xl:grid-cols-12 gap-5">
        {/* Left Column: Clients List */}
        <div
          className={`md:col-span-4 lg:col-span-4 2xl:col-span-3 md:sticky md:top-20 md:h-[calc(100vh-6.5rem)] h-[calc(100dvh-12rem)] ${
            mobileShowDetail ? 'hidden md:block' : 'block'
          }`}
        >
          <ClientList
            clients={clients}
            selectedClientId={currentClient?.id}
            onSelectClient={handleSelectClient}
            onOpenAddModal={() => setIsAddCliModalOpen(true)}
            getClientStats={getClientStats}
            searchQuery={clientSearchQuery}
            setSearchQuery={setClientSearchQuery}
            sortByDebt={sortByDebt}
            setSortByDebt={setSortByDebt}
          />
        </div>

        {/* Right Column: Active Client Details & Ledger */}
        <div
          className={`md:col-span-8 lg:col-span-8 2xl:col-span-9 space-y-4 ${
            !mobileShowDetail ? 'hidden md:block' : 'block'
          }`}
        >
          {currentClient ? (
            <>
              <ClientHeader
                client={currentClient}
                stats={stats}
                onOpenAddItem={() => setIsAddItemModalOpen(true)}
                onOpenAddPayment={() => setIsAddPaymentModalOpen(true)}
                onOpenEdit={() => setIsEditCliModalOpen(true)}
                onDeleteClient={handleDeleteClient}
              />

              <ClientLedger
                transactions={transactions}
                onDeleteTransaction={deleteClientTransaction}
                onOpenAddItem={() => setIsAddItemModalOpen(true)}
                onOpenAddPayment={() => setIsAddPaymentModalOpen(true)}
              />
            </>
          ) : (
            <div className="surface-card rounded-xl border border-white/5 p-8 text-center">
              <EmptyState
                title="Клиенты еще не добавлены"
                description="Создайте первую карточку клиента для ведения учета"
                actionLabel="+ Создать клиента"
                onAction={() => setIsAddCliModalOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={isAddCliModalOpen}
        onClose={() => setIsAddCliModalOpen(false)}
        onAddClient={addClient}
        onSelectClient={handleSelectClient}
      />

      <EditClientModal
        isOpen={isEditCliModalOpen}
        onClose={() => setIsEditCliModalOpen(false)}
        client={currentClient}
        onUpdateClient={updateClient}
      />

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        client={currentClient}
        suppliersList={data.suppliersList || []}
        onAddTransaction={addClientTransaction}
        onAddSupplier={addSupplierToDirectory}
      />

      <AddPaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        client={currentClient}
        onAddTransaction={addClientTransaction}
      />
    </div>
  );
}

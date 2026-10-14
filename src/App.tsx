import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { OfflineIndicator } from './components/layout/OfflineIndicator';
import { TransactionModal } from './components/ledger/TransactionModal';
import { CustomerLedgerDrawer } from './components/customers/CustomerLedgerDrawer';
import { InvoiceBuilderModal } from './components/invoices/InvoiceBuilderModal';
import { InvoicePrintView } from './components/invoices/InvoicePrintView';
import { BusinessProfileModal } from './components/business/BusinessProfileModal';
import { TeamAccessModal } from './components/access/TeamAccessModal';

// Views
import { DashboardView } from './features/dashboard/DashboardView';
import { CustomersView } from './features/customers/CustomersView';
import { SuppliersView } from './features/suppliers/SuppliersView';
import { InvoicesView } from './features/invoices/InvoicesView';
import { ProductsView } from './features/inventory/ProductsView';
import { ExpensesView } from './features/expenses/ExpensesView';
import { ReportsView } from './features/reports/ReportsView';
import { AdminView } from './features/admin/AdminView';
import { OnboardingView } from './features/onboarding/OnboardingView';

import { Customer, Invoice } from './types';

const MainApp: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { activeBusiness, loading: bizLoading, isAuthorized } = useBusiness();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals & Drawers state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState<'you_gave' | 'you_got'>('you_gave');
  const [txPreselectedPartyId, setTxPreselectedPartyId] = useState<string | undefined>(undefined);
  const [txPreselectedPartyType, setTxPreselectedPartyType] = useState<'customer' | 'supplier'>('customer');

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerLedgerOpen, setIsCustomerLedgerOpen] = useState(false);

  const [isInvoiceBuilderOpen, setIsInvoiceBuilderOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [isInvoicePrintOpen, setIsInvoicePrintOpen] = useState(false);

  const [isBusinessProfileOpen, setIsBusinessProfileOpen] = useState(false);
  const [isTeamAccessOpen, setIsTeamAccessOpen] = useState(false);

  const handleOpenTransaction = (
    defaultType: 'you_gave' | 'you_got' = 'you_gave',
    partyId?: string,
    partyType: 'customer' | 'supplier' = 'customer'
  ) => {
    setTxDefaultType(defaultType);
    setTxPreselectedPartyId(partyId);
    setTxPreselectedPartyType(partyType);
    setIsTxModalOpen(true);
  };

  const handleOpenCustomerLedger = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerLedgerOpen(true);
  };

  const handleOpenInvoicePrint = (invoice: Invoice) => {
    setSelectedInvoiceForPrint(invoice);
    setIsInvoicePrintOpen(true);
  };

  const isAuthenticated = Boolean(user || profile);

  if (authLoading || bizLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center animate-pulse mb-3 shadow-lg shadow-emerald-900/50">
          <span className="text-xl font-black">₹</span>
        </div>
        <p className="text-sm font-bold text-slate-300">Connecting to Anu Tools Real Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onOpenNewTransaction={(type) => handleOpenTransaction(type || 'you_gave')}
        onOpenBusinessProfile={() => setIsBusinessProfileOpen(true)}
        onOpenTeamAccess={() => setIsTeamAccessOpen(true)}
        onOpenSignIn={() => {}}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-20 lg:pb-10">
        {!isAuthenticated || !isAuthorized ? (
          <OnboardingView />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                onOpenNewTransaction={(type) => handleOpenTransaction(type || 'you_gave')}
                onOpenCustomerLedger={handleOpenCustomerLedger}
                onOpenInvoiceBuilder={() => setIsInvoiceBuilderOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersView
                onOpenCustomerLedger={handleOpenCustomerLedger}
                onOpenTransaction={(type, id) => handleOpenTransaction(type, id, 'customer')}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersView
                onOpenTransaction={(type, id) => handleOpenTransaction(type, id, 'supplier')}
              />
            )}

            {activeTab === 'invoices' && (
              <InvoicesView
                onOpenInvoiceBuilder={() => setIsInvoiceBuilderOpen(true)}
                onOpenInvoicePrint={handleOpenInvoicePrint}
              />
            )}

            {activeTab === 'products' && <ProductsView />}

            {activeTab === 'expenses' && <ExpensesView />}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'admin' && <AdminView />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation - only when authenticated & authorized */}
      {isAuthenticated && isAuthorized && activeBusiness && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewTransaction={() => handleOpenTransaction('you_gave')}
        />
      )}

      {/* Modals & Drawers */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setTxPreselectedPartyId(undefined);
        }}
        defaultType={txDefaultType}
        preselectedPartyId={txPreselectedPartyId}
        preselectedPartyType={txPreselectedPartyType}
      />

      <CustomerLedgerDrawer
        isOpen={isCustomerLedgerOpen}
        customer={selectedCustomer}
        onClose={() => {
          setIsCustomerLedgerOpen(false);
          setSelectedCustomer(null);
        }}
        onOpenTransaction={(type, partyId) => {
          handleOpenTransaction(type, partyId, 'customer');
        }}
      />

      <InvoiceBuilderModal
        isOpen={isInvoiceBuilderOpen}
        onClose={() => setIsInvoiceBuilderOpen(false)}
        onInvoiceCreated={(id) => {
          const inv = activeBusiness ? ({ id } as Invoice) : null;
          if (inv) setSelectedInvoiceForPrint(inv);
        }}
      />

      <InvoicePrintView
        isOpen={isInvoicePrintOpen}
        invoice={selectedInvoiceForPrint}
        business={activeBusiness}
        onClose={() => {
          setIsInvoicePrintOpen(false);
          setSelectedInvoiceForPrint(null);
        }}
      />

      <BusinessProfileModal
        isOpen={isBusinessProfileOpen}
        onClose={() => setIsBusinessProfileOpen(false)}
      />

      <TeamAccessModal
        isOpen={isTeamAccessOpen}
        onClose={() => setIsTeamAccessOpen(false)}
      />

      {/* Offline Status Floating Toast */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <MainApp />
      </BusinessProvider>
    </AuthProvider>
  );
}

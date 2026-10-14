import React from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Customer, Transaction, Reminder } from '../../types';
import { formatINR, formatDate, buildWhatsAppReminderUrl } from '../../lib/formatters';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Clock,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Package,
  Plus
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewTransaction: (type?: 'you_gave' | 'you_got') => void;
  onOpenCustomerLedger: (customer: Customer) => void;
  onOpenInvoiceBuilder: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTransaction,
  onOpenCustomerLedger,
  onOpenInvoiceBuilder,
  onNavigateTab,
}) => {
  const {
    activeBusiness,
    customers,
    suppliers,
    transactions,
    products,
    expenses,
    reminders,
  } = useBusiness();

  // Metrics calculation
  const totalReceivable = customers
    .filter((c) => c.currentBalance > 0)
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const totalPayable = suppliers
    .filter((s) => s.currentBalance > 0)
    .reduce((sum, s) => sum + s.currentBalance, 0);

  const todayStr = new Date().toDateString();
  const todayReceived = transactions
    .filter((t) => t.type === 'you_got' && new Date(t.date).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpenses = expenses
    .filter((e) => new Date(e.date).toDateString() === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const lowStockItems = products.filter((p) => p.currentStock <= p.minStockAlert);
  const pendingReminders = reminders.filter((r) => r.status === 'pending');
  const recentTransactions = transactions.slice(0, 8);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome & Fast Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeBusiness?.name || 'Vyapar Store Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time business balance, customer ledger, and daily khata overview.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenNewTransaction('you_gave')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>You Gave ₹</span>
          </button>
          <button
            onClick={() => onOpenNewTransaction('you_got')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>You Got ₹</span>
          </button>
          <button
            onClick={onOpenInvoiceBuilder}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>+ GST Bill</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* To Collect (Receivable) */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-400/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              You&apos;ll Receive (Due)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {formatINR(totalReceivable)}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              From {customers.filter((c) => c.currentBalance > 0).length} customers
            </p>
          </div>
        </div>

        {/* To Pay (Suppliers) */}
        <div
          onClick={() => onNavigateTab('suppliers')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              You&apos;ll Pay (Payable)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {formatINR(totalPayable)}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              To {suppliers.filter((s) => s.currentBalance > 0).length} suppliers
            </p>
          </div>
        </div>

        {/* Today's Collections */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Collection
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatINR(todayReceived)}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Received in shop today
            </p>
          </div>
        </div>

        {/* Today's Expenses */}
        <div
          onClick={() => onNavigateTab('expenses')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatINR(todayExpenses)}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Recorded expenditures today
            </p>
          </div>
        </div>

      </div>

      {/* Low Stock Warning Banner if any items are low */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Low Stock Alert: {lowStockItems.length} items below safety limit
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {lowStockItems.map((p) => `${p.name} (${p.currentStock} ${p.unit})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs shrink-0 cursor-pointer"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* 2-Column Section: Customers Dues & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Outstanding Customers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Highest Customer Dues</h3>
            </div>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              View All ({customers.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 flex-1 overflow-y-auto mt-2">
            {customers.filter((c) => c.currentBalance > 0).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No outstanding customer dues recorded.
              </div>
            ) : (
              customers
                .filter((c) => c.currentBalance > 0)
                .sort((a, b) => b.currentBalance - a.currentBalance)
                .slice(0, 5)
                .map((cust) => {
                  const waUrl = buildWhatsAppReminderUrl({
                    phone: cust.phone,
                    customerName: cust.name,
                    businessName: activeBusiness?.name || 'Vyapar Store',
                    amount: cust.currentBalance,
                    upiId: activeBusiness?.upiId,
                  });

                  return (
                    <div
                      key={cust.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition"
                    >
                      <div
                        onClick={() => onOpenCustomerLedger(cust)}
                        className="cursor-pointer"
                      >
                        <p className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition">
                          {cust.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{cust.phone}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                            {formatINR(cust.currentBalance)}
                          </span>
                          <p className="text-[10px] text-slate-400 font-medium">Due</p>
                        </div>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-600 hover:text-white transition"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Recent Transaction Activity Feed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Khata Transactions</h3>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Daybook Report
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 flex-1 overflow-y-auto mt-2 space-y-1">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No recent transactions yet. Click &quot;You Gave&quot; or &quot;You Got&quot; above to record entries.
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const isGave = tx.type === 'you_gave';
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isGave
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                        }`}
                      >
                        {isGave ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px] sm:max-w-[200px]">
                          {tx.partyName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatDate(tx.date)} • {tx.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-black ${
                          isGave ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isGave ? '+' : '-'}{formatINR(tx.amount)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Bal: {formatINR(tx.balanceAfter)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

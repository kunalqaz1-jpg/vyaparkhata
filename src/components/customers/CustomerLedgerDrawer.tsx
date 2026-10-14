import React, { useState } from 'react';
import { Customer, Transaction } from '../../types';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR, formatDate, buildWhatsAppReminderUrl } from '../../lib/formatters';
import {
  X,
  Phone,
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileSpreadsheet,
  Download,
  AlertCircle
} from 'lucide-react';

interface CustomerLedgerDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTransaction: (type: 'you_gave' | 'you_got', partyId: string) => void;
}

export const CustomerLedgerDrawer: React.FC<CustomerLedgerDrawerProps> = ({
  customer,
  isOpen,
  onClose,
  onOpenTransaction,
}) => {
  const { transactions, activeBusiness } = useBusiness();
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'month' | 'today'>('all');

  if (!isOpen || !customer) return null;

  // Filter transactions for this customer
  const customerTx = transactions.filter(
    (t) => t.partyType === 'customer' && t.partyId === customer.id
  );

  const filteredTx = customerTx.filter((t) => {
    if (filterPeriod === 'all') return true;
    const txDate = new Date(t.date);
    const now = new Date();
    if (filterPeriod === 'today') {
      return txDate.toDateString() === now.toDateString();
    }
    if (filterPeriod === 'month') {
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  const isDue = customer.currentBalance > 0;
  const isAdvance = customer.currentBalance < 0;

  const whatsappUrl = buildWhatsAppReminderUrl({
    phone: customer.phone,
    customerName: customer.name,
    businessName: activeBusiness?.name || 'Vyapar Merchant',
    amount: Math.abs(customer.currentBalance),
    upiId: activeBusiness?.upiId,
  });

  const exportLedgerCsv = () => {
    const headers = ['Date', 'Type', 'Amount (INR)', 'Balance After (INR)', 'Payment Mode', 'Bill No', 'Description'];
    const rows = customerTx.map((t) => [
      formatDate(t.date),
      t.type === 'you_gave' ? 'You Gave' : 'You Got',
      t.amount,
      t.balanceAfter,
      t.paymentMethod,
      t.billNumber || '',
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${customer.name.replace(/\s+/g, '_')}_Khata_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl animate-slide-left border-l border-slate-200 dark:border-slate-800">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center font-black text-lg text-white">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">{customer.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <span>{customer.phone}</span>
                {customer.address && <span className="truncate max-w-[150px]">• {customer.address}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportLedgerCsv}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Download Ledger CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Balance Banner */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Net Outstanding Balance
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={`text-2xl sm:text-3xl font-black ${
                    isDue
                      ? 'text-rose-600 dark:text-rose-400'
                      : isAdvance
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {formatINR(Math.abs(customer.currentBalance))}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isDue
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : isAdvance
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  {isDue ? 'You Will Receive' : isAdvance ? 'Advance Credit' : 'Settled'}
                </span>
              </div>
            </div>

            {/* Fast Action Buttons: WhatsApp Reminder & Call */}
            <div className="flex items-center gap-2">
              {isDue && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Reminder</span>
                </a>
              )}
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Call</span>
              </a>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Ledger Entries ({filteredTx.length})
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['all', 'month', 'today'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                  filterPeriod === p
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p === 'all' ? 'All Time' : p === 'month' ? 'This Month' : 'Today'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Transaction Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTx.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No transactions recorded yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Use the buttons below to record credit sales or customer payments.
              </p>
            </div>
          ) : (
            filteredTx.map((tx) => {
              const isGave = tx.type === 'you_gave';
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isGave
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isGave ? (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {isGave ? 'You Gave' : 'You Got'}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {tx.paymentMethod}
                        </span>
                        {tx.billNumber && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            #{tx.billNumber}
                          </span>
                        )}
                      </div>
                      {tx.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          {tx.description}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(tx.date)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="text-right">
                    <span
                      className={`text-base font-black ${
                        isGave
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isGave ? '+' : '-'}{formatINR(tx.amount)}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Bal: <span className="font-semibold">{formatINR(tx.balanceAfter ?? 0)}</span>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Dual Action Buttons */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <button
            onClick={() => onOpenTransaction('you_gave', customer.id)}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>YOU GAVE ₹ (Debit)</span>
          </button>
          <button
            onClick={() => onOpenTransaction('you_got', customer.id)}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>YOU GOT ₹ (Credit)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

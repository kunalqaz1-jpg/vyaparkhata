import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Invoice } from '../../types';
import { formatINR, formatDate } from '../../lib/formatters';
import {
  FileText,
  Search,
  Plus,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface InvoicesViewProps {
  onOpenInvoiceBuilder: () => void;
  onOpenInvoicePrint: (invoice: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  onOpenInvoiceBuilder,
  onOpenInvoicePrint,
}) => {
  const { invoices, updateInvoiceStatus } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalDue = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const handleMarkPaid = async (e: React.MouseEvent, inv: Invoice) => {
    e.stopPropagation();
    await updateInvoiceStatus(inv.id, 'paid', inv.totalAmount);
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              GST Invoices & Bills ({invoices.length})
            </h1>
            <p className="text-xs text-slate-500">
              Total Sales Billed: <span className="font-bold text-slate-900 dark:text-white">{formatINR(totalBilled)}</span> • Balance Due: <span className="font-bold text-rose-600">{formatINR(totalDue)}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenInvoiceBuilder}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create GST Bill</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search invoice number or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {[
            { id: 'all', label: 'All' },
            { id: 'unpaid', label: 'Unpaid' },
            { id: 'partially_paid', label: 'Partial' },
            { id: 'paid', label: 'Paid' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-2">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No invoices generated yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Generate clean GST compliant tax bills with itemized taxes and print/share anytime.
            </p>
            <button
              onClick={onOpenInvoiceBuilder}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
            >
              + Create First Invoice
            </button>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'paid';
            const isPartial = inv.status === 'partially_paid';

            return (
              <div
                key={inv.id}
                onClick={() => onOpenInvoicePrint(inv)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 p-4 rounded-xl shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                      #{inv.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isPartial
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {inv.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {inv.customerName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Date: {formatDate(inv.issueDate)} • {inv.items.length} items
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatINR(inv.totalAmount)}
                    </span>
                    {inv.balanceDue > 0 ? (
                      <p className="text-[10px] text-rose-600 font-bold">
                        Due: {formatINR(inv.balanceDue)}
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 font-bold">Fully Settled</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isPaid && (
                      <button
                        onClick={(e) => handleMarkPaid(e, inv)}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-600 hover:text-white transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Mark as Paid"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Mark Paid</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInvoicePrint(inv);
                      }}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Print or View Invoice PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

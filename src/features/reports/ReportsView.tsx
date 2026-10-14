import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR, formatDate } from '../../lib/formatters';
import {
  BarChart3,
  Download,
  Users,
  Truck,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { customers, suppliers, transactions, invoices, expenses, activeBusiness } = useBusiness();
  const [activeReport, setActiveReport] = useState<'outstanding' | 'payables' | 'pnl' | 'daybook'>('outstanding');

  // Customer Outstanding Report
  const outstandingCustomers = customers
    .filter((c) => c.currentBalance > 0)
    .sort((a, b) => b.currentBalance - a.currentBalance);

  const totalOutstanding = outstandingCustomers.reduce((sum, c) => sum + c.currentBalance, 0);

  // Supplier Payables
  const payableSuppliers = suppliers
    .filter((s) => s.currentBalance > 0)
    .sort((a, b) => b.currentBalance - a.currentBalance);

  const totalPayables = payableSuppliers.reduce((sum, s) => sum + s.currentBalance, 0);

  // Profit & Loss calculation
  const totalSalesRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  // Estimated COGS roughly 70% of sales if not itemized
  const estimatedCogs = totalSalesRevenue * 0.70;
  const estimatedGrossProfit = Math.max(0, totalSalesRevenue - estimatedCogs);
  const estimatedNetProfit = estimatedGrossProfit - totalExpenses;

  // Daybook summary
  const totalInflow = transactions
    .filter((t) => t.type === 'you_got' || t.type === 'payment_in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'you_gave' || t.type === 'payment_out')
    .reduce((sum, t) => sum + t.amount, 0) + totalExpenses;

  // CSV Exporter helper
  const exportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeBusiness?.name?.replace(/\s+/g, '_')}_${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCurrent = () => {
    if (activeReport === 'outstanding') {
      exportCsv(
        'Customer_Outstanding_Report',
        ['Customer Name', 'Phone', 'Address', 'Balance Due (INR)'],
        outstandingCustomers.map((c) => [
          `"${c.name}"`,
          c.phone,
          `"${c.address || ''}"`,
          c.currentBalance,
        ])
      );
    } else if (activeReport === 'payables') {
      exportCsv(
        'Supplier_Payables_Report',
        ['Supplier Name', 'Phone', 'GSTIN', 'Payable Amount (INR)'],
        payableSuppliers.map((s) => [
          `"${s.name}"`,
          s.phone,
          s.gstin || '',
          s.currentBalance,
        ])
      );
    } else if (activeReport === 'daybook') {
      exportCsv(
        'Daybook_Transactions_Report',
        ['Date', 'Party Name', 'Type', 'Amount (INR)', 'Payment Mode', 'Bill No'],
        transactions.map((t) => [
          formatDate(t.date),
          `"${t.partyName}"`,
          t.type,
          t.amount,
          t.paymentMethod,
          t.billNumber || '',
        ])
      );
    }
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Business Reports & Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Audit-ready financial statements, customer ledger reports & P&L estimation.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCurrent}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 shadow-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Report CSV</span>
        </button>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-bold">
        <button
          onClick={() => setActiveReport('outstanding')}
          className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeReport === 'outstanding'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-rose-500" />
          <span>Customer Dues</span>
        </button>

        <button
          onClick={() => setActiveReport('payables')}
          className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeReport === 'payables'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4 text-emerald-500" />
          <span>Supplier Payables</span>
        </button>

        <button
          onClick={() => setActiveReport('pnl')}
          className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeReport === 'pnl'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span>Profit & Loss</span>
        </button>

        <button
          onClick={() => setActiveReport('daybook')}
          className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeReport === 'daybook'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>Daybook Cashflow</span>
        </button>
      </div>

      {/* Report 1: Customer Outstanding Report */}
      {activeReport === 'outstanding' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Customer Outstanding (Udhar Aging)
              </h2>
              <p className="text-xs text-slate-400">Total receivables across active customer accounts</p>
            </div>
            <div className="text-right">
              <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
                {formatINR(totalOutstanding)}
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total To Collect</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Outstanding (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {outstandingCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Zero outstanding customer dues. Excellent!
                    </td>
                  </tr>
                ) : (
                  outstandingCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="py-3 px-4 text-slate-500">{c.phone}</td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{c.address || '-'}</td>
                      <td className="py-3 px-4 text-right font-black text-rose-600 dark:text-rose-400">
                        {formatINR(c.currentBalance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Supplier Payables Report */}
      {activeReport === 'payables' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Supplier & Wholesaler Payables
              </h2>
              <p className="text-xs text-slate-400">Unsettled purchase dues to suppliers</p>
            </div>
            <div className="text-right">
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {formatINR(totalPayables)}
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total To Pay</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4 text-right">Payable (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payableSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No outstanding supplier payables recorded.
                    </td>
                  </tr>
                ) : (
                  payableSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                      <td className="py-3 px-4 text-slate-500">{s.phone}</td>
                      <td className="py-3 px-4 font-mono text-indigo-400">{s.gstin || '-'}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatINR(s.currentBalance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Estimated Profit & Loss */}
      {activeReport === 'pnl' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Estimated Profit & Loss Summary</h2>
            <p className="text-xs text-slate-400">
              Computed based on invoiced sales revenue, estimated inventory COGS, and recorded operational expenses.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 text-sm">
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Gross Sales Billed:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatINR(totalSalesRevenue)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Estimated Cost of Goods Sold (COGS):</span>
              <span className="font-medium text-rose-600">-{formatINR(estimatedCogs)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200 border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>Estimated Gross Profit:</span>
              <span>{formatINR(estimatedGrossProfit)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Operating Expenses (Rent, Bills, Wages):</span>
              <span className="font-medium text-rose-600">-{formatINR(totalExpenses)}</span>
            </div>
            <div className="flex justify-between items-center font-black text-base text-slate-900 dark:text-white border-t-2 border-slate-900 dark:border-slate-600 pt-3">
              <span>Estimated Net Operating Profit:</span>
              <span className={estimatedNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                {formatINR(estimatedNetProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Report 4: Daybook / Cashflow */}
      {activeReport === 'daybook' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Daybook Statement</h2>
              <p className="text-xs text-slate-400">All inbound collections and outbound disbursements</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div>
                <span className="text-slate-400">Total Inflow: </span>
                <span className="text-emerald-600">{formatINR(totalInflow)}</span>
              </div>
              <div>
                <span className="text-slate-400">Total Outflow: </span>
                <span className="text-rose-600">{formatINR(totalOutflow)}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Party / Account</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No daybook records found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isIn = tx.type === 'you_got' || tx.type === 'payment_in';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-slate-500">{formatDate(tx.date)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{tx.partyName}</td>
                        <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                          {tx.type === 'you_gave' ? 'You Gave' : 'You Got'}
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] text-slate-500 font-bold">
                          {tx.paymentMethod}
                        </td>
                        <td className={`py-3 px-4 text-right font-black ${isIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isIn ? '+' : '-'}{formatINR(tx.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

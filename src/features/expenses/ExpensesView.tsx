import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR, formatDate } from '../../lib/formatters';
import { Expense } from '../../types';
import {
  CreditCard,
  Plus,
  Search,
  Calendar,
  X,
  TrendingDown,
  PieChart
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Expense form
  const [category, setCategory] = useState('Tea & Refreshment');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer' | 'card' | 'cheque' | 'other'>('cash');
  const [vendorName, setVendorName] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [billNumber, setBillNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const expenseCategories = [
    'Rent',
    'Electricity Bill',
    'Staff Wages & Advance',
    'Tea & Refreshment',
    'Transport & Logistics',
    'Packaging Materials',
    'Maintenance & Repairs',
    'Shop Licence / CA Fees',
    'Marketing & Ads',
    'Other Expense',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.vendorName && e.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterCategory === 'all') return true;
    return e.category === filterCategory;
  });

  const totalExpenseAll = expenses.reduce((sum, e) => sum + e.amount, 0);

  const thisMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid expense amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await addExpense({
        category,
        amount: numAmount,
        paymentMethod,
        vendorName: vendorName.trim(),
        notes: notes.trim(),
        date: new Date(date).toISOString(),
        billNumber: billNumber.trim(),
      });
      setShowAddModal(false);
      setAmount('');
      setVendorName('');
      setNotes('');
      setBillNumber('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to record expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Business Expenses ({expenses.length})
            </h1>
            <p className="text-xs text-slate-500">
              This Month: <span className="font-bold text-rose-600">{formatINR(thisMonthExpenses)}</span> • Total Recorded: <span className="font-bold text-slate-900 dark:text-white">{formatINR(totalExpenseAll)}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Expense</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search expense category, vendor or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="all">All Categories</option>
          {expenseCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Expenses List */}
      <div className="space-y-2">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <TrendingDown className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No expenses recorded</h3>
            <p className="text-xs text-slate-400 mt-1">
              Record shop expenses like rent, tea, electricity, and helper wages to calculate real store profit.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
            >
              + Record First Expense
            </button>
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400/50 p-4 rounded-xl shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {exp.category}
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {exp.paymentMethod}
                    </span>
                    {exp.billNumber && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Voucher #{exp.billNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {exp.vendorName ? `Paid to ${exp.vendorName}` : 'Shop operational cost'}
                    {exp.notes && ` • ${exp.notes}`}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(exp.date)}</span>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                <span className="text-base font-black text-rose-600 dark:text-rose-400">
                  -{formatINR(exp.amount)}
                </span>
                <p className="text-[10px] text-slate-400">Expenditure</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-scale-up">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <h2 className="text-base font-bold">Record Expense</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="p-4 sm:p-5 space-y-3.5">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {expenseCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-lg font-black rounded-lg border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="cash">Cash (Rokad)</option>
                    <option value="upi">UPI (GPay / Paytm)</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Paid To / Vendor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Landlord, JVVNL, Helper"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Voucher / Receipt #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VCH-009"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Details about expenditure"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  {isSubmitting ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

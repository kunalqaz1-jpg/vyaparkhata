import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Supplier } from '../../types';
import { formatINR } from '../../lib/formatters';
import {
  Truck,
  Search,
  UserPlus,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Building
} from 'lucide-react';

interface SuppliersViewProps {
  onOpenTransaction: (type: 'you_gave' | 'you_got', partyId: string, partyType: 'supplier') => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ onOpenTransaction }) => {
  const { suppliers, addSupplier } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Supplier Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  const totalPayable = suppliers
    .filter((s) => s.currentBalance > 0)
    .reduce((sum, s) => sum + s.currentBalance, 0);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Supplier name and phone number are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await addSupplier({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        gstin: gstin.trim().toUpperCase(),
        openingBalance: Number(openingBalance) || 0,
      });
      setShowAddModal(false);
      setName('');
      setPhone('');
      setAddress('');
      setGstin('');
      setOpeningBalance(0);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add supplier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Suppliers & Wholesalers ({suppliers.length})
            </h1>
            <p className="text-xs text-slate-500">
              Total Payables (To Pay): <span className="font-bold text-emerald-600">{formatINR(totalPayable)}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Supplier</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by supplier or distributor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="space-y-2">
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <Truck className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No suppliers registered</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add your distributors, dealers, or mandi suppliers to track purchase payables.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
            >
              + Add New Supplier
            </button>
          </div>
        ) : (
          filteredSuppliers.map((supp) => {
            const hasPayable = supp.currentBalance > 0;

            return (
              <div
                key={supp.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400/50 p-4 rounded-xl shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 shrink-0">
                    {supp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {supp.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{supp.phone}</span>
                      {supp.address && <span>• {supp.address}</span>}
                    </p>
                    {supp.gstin && (
                      <p className="text-[10px] font-mono text-indigo-400 mt-0.5">
                        GSTIN: {supp.gstin}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-base font-black ${
                        hasPayable
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatINR(Math.abs(supp.currentBalance))}
                    </span>
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      {hasPayable ? 'You will pay' : 'Settled / Advance'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${supp.phone}`}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Call Supplier"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onOpenTransaction('you_gave', supp.id, 'supplier')}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                      title="Make Payment to Supplier"
                    >
                      Pay ₹
                    </button>
                    <button
                      onClick={() => onOpenTransaction('you_got', supp.id, 'supplier')}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Record Purchase Bill"
                    >
                      Purchase ₹
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-scale-up">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold">Add New Supplier</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-4 sm:p-5 space-y-3.5">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hindustan Unilever Distributor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Warehouse / Office Address
                </label>
                <input
                  type="text"
                  placeholder="Mandi, Area, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="15-digit GSTIN"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Opening Payable (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={openingBalance || ''}
                    onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
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
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

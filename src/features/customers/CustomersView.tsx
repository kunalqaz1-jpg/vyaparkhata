import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Customer } from '../../types';
import { formatINR, buildWhatsAppReminderUrl } from '../../lib/formatters';
import {
  Users,
  Search,
  UserPlus,
  MessageSquare,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  FileSpreadsheet,
  AlertCircle,
  Trash2
} from 'lucide-react';

interface CustomersViewProps {
  onOpenCustomerLedger: (customer: Customer) => void;
  onOpenTransaction: (type: 'you_gave' | 'you_got', partyId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onOpenCustomerLedger,
  onOpenTransaction,
}) => {
  const { customers, addCustomer, deleteCustomer, activeBusiness } = useBusiness();
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'due' | 'advance' | 'settled'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterType === 'due') return c.currentBalance > 0;
    if (filterType === 'advance') return c.currentBalance < 0;
    if (filterType === 'settled') return c.currentBalance === 0;
    return true;
  });

  const totalDue = customers
    .filter((c) => c.currentBalance > 0)
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Customer name and phone number are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        gstin: gstin.trim().toUpperCase(),
        openingBalance: Number(openingBalance) || 0,
      });
      setShowAddModal(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setGstin('');
      setOpeningBalance(0);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Customer Khata ({customers.length})
            </h1>
            <p className="text-xs text-slate-500">
              Total Pending Dues: <span className="font-bold text-rose-600">{formatINR(totalDue)}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {[
            { id: 'all', label: 'All' },
            { id: 'due', label: 'Due' },
            { id: 'advance', label: 'Advance' },
            { id: 'settled', label: 'Settled' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                filterType === f.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Cards List */}
      <div className="space-y-2">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No customers found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add your first customer to start tracking credit and payments.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
            >
              + Add New Customer
            </button>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const isDue = cust.currentBalance > 0;
            const isAdvance = cust.currentBalance < 0;

            const waUrl = buildWhatsAppReminderUrl({
              phone: cust.phone,
              customerName: cust.name,
              businessName: activeBusiness?.name || 'Vyapar Store',
              amount: Math.abs(cust.currentBalance),
              upiId: activeBusiness?.upiId,
            });

            return (
              <div
                key={cust.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 p-4 rounded-xl shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Customer Details Clickable Area */}
                <div
                  onClick={() => onOpenCustomerLedger(cust)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 shrink-0">
                    {cust.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition">
                      {cust.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{cust.phone}</span>
                      {cust.address && <span>• {cust.address}</span>}
                    </p>
                  </div>
                </div>

                {/* Balances & Fast Action Triggers */}
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-base font-black ${
                        isDue
                          ? 'text-rose-600 dark:text-rose-400'
                          : isAdvance
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatINR(Math.abs(cust.currentBalance))}
                    </span>
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      {isDue ? 'You will get' : isAdvance ? 'Advance' : 'Settled'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {isDue && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-600 hover:text-white transition"
                        title="Send WhatsApp Payment Reminder"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onOpenTransaction('you_gave', cust.id)}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Give Credit"
                    >
                      Gave ₹
                    </button>
                    <button
                      onClick={() => onOpenTransaction('you_got', cust.id)}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                      title="Receive Payment"
                    >
                      Got ₹
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomerToDelete(cust);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Safe Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Customer "{customerToDelete.name}"?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently remove this customer and their record from the real database.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="flex-1 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteCustomer(customerToDelete.id);
                  setCustomerToDelete(null);
                }}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-scale-up">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold">Add New Customer</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-4 sm:p-5 space-y-3.5">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel / Sharma Sweets"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Area, Street, City"
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
                    Opening Due (₹)
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
                  {isSubmitting ? 'Saving...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

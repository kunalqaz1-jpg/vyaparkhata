import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR } from '../../lib/formatters';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileText,
  CreditCard,
  UserPlus
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'you_gave' | 'you_got';
  preselectedPartyId?: string;
  preselectedPartyType?: 'customer' | 'supplier';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'you_gave',
  preselectedPartyId,
  preselectedPartyType = 'customer',
}) => {
  const { customers, suppliers, recordTransaction, addCustomer } = useBusiness();

  const [type, setType] = useState<'you_gave' | 'you_got'>(defaultType);
  const [partyType, setPartyType] = useState<'customer' | 'supplier'>(preselectedPartyType);
  const [partyId, setPartyId] = useState<string>(preselectedPartyId || '');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card' | 'other'>('cash');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [billNumber, setBillNumber] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Inline quick add customer state
  const [showAddParty, setShowAddParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');
  const [recentlyAddedParty, setRecentlyAddedParty] = useState<{ id: string; name: string; phone: string; currentBalance: number } | null>(null);
  const [addedSuccessMsg, setAddedSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setPartyType(preselectedPartyType);
      setPartyId(preselectedPartyId || '');
      setAmount('');
      setDescription('');
      setBillNumber('');
      setPaymentRef('');
      setErrorMsg('');
      setShowAddParty(false);
    }
  }, [isOpen, defaultType, preselectedPartyId, preselectedPartyType]);

  if (!isOpen) return null;

  const currentPartyList = partyType === 'customer' ? customers : suppliers;
  const activePartyId = partyId || preselectedPartyId;
  const selectedParty =
    currentPartyList.find((p) => p.id === activePartyId) ||
    (recentlyAddedParty && recentlyAddedParty.id === activePartyId ? recentlyAddedParty : null);

  // Calculate live preview of new balance
  const numAmount = parseFloat(amount) || 0;
  let simulatedBalance = selectedParty ? selectedParty.currentBalance : 0;
  if (selectedParty && numAmount > 0) {
    if (partyType === 'customer') {
      simulatedBalance = type === 'you_gave'
        ? selectedParty.currentBalance + numAmount
        : selectedParty.currentBalance - numAmount;
    } else {
      simulatedBalance = type === 'you_got'
        ? selectedParty.currentBalance + numAmount
        : selectedParty.currentBalance - numAmount;
    }
  }

  const handleQuickAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim() || !newPartyPhone.trim()) {
      setErrorMsg('Please enter both name and 10-digit mobile number.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const created = await addCustomer({
        name: newPartyName.trim(),
        phone: newPartyPhone.trim(),
        openingBalance: 0,
      });
      if (created) {
        setPartyType('customer');
        setPartyId(created.id);
        setRecentlyAddedParty({
          id: created.id,
          name: created.name,
          phone: created.phone,
          currentBalance: created.currentBalance || 0,
        });
        setShowAddParty(false);
        setNewPartyName('');
        setNewPartyPhone('');
        setAddedSuccessMsg(`Customer "${created.name}" saved and selected!`);
        setTimeout(() => setAddedSuccessMsg(''), 4000);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const validId = partyId || preselectedPartyId;
    if (!validId) {
      setErrorMsg(`Please select a ${partyType}.`);
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await recordTransaction({
        partyType,
        partyId: validId,
        type,
        amount: numAmount,
        paymentMethod,
        paymentRef: paymentRef.trim(),
        description: description.trim(),
        billNumber: billNumber.trim(),
        date: new Date(date).toISOString(),
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error recording transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-scale-up">
        
        {/* Header Tabs: You Gave vs You Got */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setType('you_gave')}
            className={`flex-1 py-3.5 px-4 text-center text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
              type === 'you_gave'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-b-2 border-rose-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-600 stroke-[2.5]" />
            <span>You Gave ₹ (Udhar / Debit)</span>
          </button>
          <button
            type="button"
            onClick={() => setType('you_got')}
            className={`flex-1 py-3.5 px-4 text-center text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
              type === 'you_got'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <span>You Got ₹ (Jama / Payment)</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Party Type selector (Customer / Supplier) */}
          {!preselectedPartyId && (
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="partyType"
                  value="customer"
                  checked={partyType === 'customer'}
                  onChange={() => {
                    setPartyType('customer');
                    setPartyId('');
                  }}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Customer (Grahak)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="partyType"
                  value="supplier"
                  checked={partyType === 'supplier'}
                  onChange={() => {
                    setPartyType('supplier');
                    setPartyId('');
                  }}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Supplier / Wholesaler</span>
              </label>
            </div>
          )}

          {/* Party Selection or Quick Add */}
          {!preselectedPartyId && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select {partyType === 'customer' ? 'Customer' : 'Supplier'}
                </label>
                {partyType === 'customer' && (
                  <button
                    type="button"
                    onClick={() => setShowAddParty(!showAddParty)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{showAddParty ? 'Cancel' : '+ New Customer'}</span>
                  </button>
                )}
              </div>

              {showAddParty ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Full Name (e.g. Ramesh)"
                      value={newPartyName}
                      onChange={(e) => setNewPartyName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <input
                      type="tel"
                      placeholder="10-digit Phone Number"
                      value={newPartyPhone}
                      onChange={(e) => setNewPartyPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickAddParty}
                    disabled={isSubmitting}
                    className="w-full py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Save & Select Customer
                  </button>
                </div>
              ) : (
                <>
                  {addedSuccessMsg && (
                    <div className="mb-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      ✓ {addedSuccessMsg}
                    </div>
                  )}
                  <select
                    value={partyId}
                    onChange={(e) => setPartyId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">
                      {currentPartyList.length === 0
                        ? `-- No ${partyType}s added yet (Click + New ${partyType === 'customer' ? 'Customer' : 'Supplier'} above) --`
                        : `-- Choose ${partyType} (${currentPartyList.length}) --`}
                    </option>
                    {currentPartyList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.phone}) — Bal: {formatINR(p.currentBalance)}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )}

          {/* Amount Input with Large Rupee Symbol */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹)
            </label>
            <div className="relative rounded-xl shadow-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-9 pr-4 py-3 text-2xl font-black rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 transition ${
                  type === 'you_gave'
                    ? 'border-rose-300 dark:border-rose-900/60 focus:ring-rose-500'
                    : 'border-emerald-300 dark:border-emerald-900/60 focus:ring-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Live Balance Preview Banner */}
          {selectedParty && numAmount > 0 && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Current Balance: </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{formatINR(selectedParty.currentBalance)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">New Balance: </span>
                <span className={`font-black ${simulatedBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatINR(simulatedBalance)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>Payment Mode</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="cash">Cash (Rokad)</option>
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="bank_transfer">Bank Transfer / NEFT / IMPS</option>
                <option value="cheque">Cheque</option>
                <option value="card">Debit / Credit Card</option>
                <option value="other">Credit Account / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Reference / Bill Number & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Bill # / UPI Ref (Optional)</span>
              </label>
              <input
                type="text"
                placeholder={paymentMethod === 'upi' ? 'e.g. UPI/328491...' : 'e.g. BIL-104'}
                value={billNumber || paymentRef}
                onChange={(e) => {
                  setBillNumber(e.target.value);
                  setPaymentRef(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Items Detail (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 5kg Atta, 2L Oil"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${
                type === 'you_gave'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              <span>{isSubmitting ? 'Recording...' : `Save ${type === 'you_gave' ? 'You Gave' : 'You Got'}`}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

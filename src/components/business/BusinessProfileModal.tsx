import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Business } from '../../types';
import {
  Building2,
  X,
  QrCode,
  Share2,
  Save,
  Check,
  Phone,
  MapPin,
  Store,
  CreditCard
} from 'lucide-react';

interface BusinessProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessProfileModal: React.FC<BusinessProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeBusiness, updateBusiness } = useBusiness();

  const [name, setName] = useState(activeBusiness?.name || '');
  const [category, setCategory] = useState(activeBusiness?.category || '');
  const [address, setAddress] = useState(activeBusiness?.address || '');
  const [phone, setPhone] = useState(activeBusiness?.phone || '');
  const [gstin, setGstin] = useState(activeBusiness?.gstin || '');
  const [upiId, setUpiId] = useState(activeBusiness?.upiId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'card'>('profile');

  if (!isOpen || !activeBusiness) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await updateBusiness({
        name: name.trim(),
        category: category.trim(),
        address: address.trim(),
        phone: phone.trim(),
        gstin: gstin.trim().toUpperCase(),
        upiId: upiId.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareText = () => {
    const text = `${name}\nCategory: ${category}\nPhone: ${phone}\nAddress: ${address}${upiId ? `\nUPI Payment ID: ${upiId}` : ''}\nManaged via VyaparKhata PWA`;
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-scale-up">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-black tracking-tight">Business Profile & Card</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-xs font-bold transition cursor-pointer border-b-2 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Store Settings
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 text-xs font-bold transition cursor-pointer border-b-2 ${
              activeTab === 'card'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Digital Visiting Card & QR
          </button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4">
            {savedSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Business profile updated successfully!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Business / Store Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kirana, Hardware, Electronics"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Store Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 08AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Merchant UPI ID (For Payments)
                </label>
                <input
                  type="text"
                  placeholder="e.g. storename@upi / 9829012345@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Visiting Card Tab */
          <div className="p-4 sm:p-6 space-y-4">
            {/* Card Preview */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase mb-2">
                    Verified Vyapar Merchant
                  </div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">{activeBusiness.name}</h3>
                  <p className="text-xs text-indigo-200 mt-0.5">{activeBusiness.category || 'General Merchant Store'}</p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Store className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{activeBusiness.phone}</span>
                  </div>
                  {activeBusiness.address && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{activeBusiness.address}</span>
                    </div>
                  )}
                  {activeBusiness.gstin && (
                    <div className="text-[11px] font-mono text-indigo-300">
                      GSTIN: {activeBusiness.gstin}
                    </div>
                  )}
                </div>

                {activeBusiness.upiId && (
                  <div className="sm:text-right bg-white/5 p-2 rounded-xl border border-white/10 flex sm:flex-col items-center sm:items-end justify-between">
                    <div>
                      <p className="text-[10px] text-slate-300 uppercase font-semibold">Pay via UPI</p>
                      <p className="font-mono font-bold text-xs text-emerald-400 mt-0.5">{activeBusiness.upiId}</p>
                    </div>
                    <QrCode className="w-8 h-8 text-white mt-1" />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={copyShareText}
                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Card Details</span>
              </button>

              {copiedToast && (
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center animate-fade-in">
                  ✓ Visiting card text copied to clipboard!
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

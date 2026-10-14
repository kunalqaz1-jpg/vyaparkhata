import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserPlus, Trash2, X, Check, Mail, Key } from 'lucide-react';

interface TeamAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamAccessModal: React.FC<TeamAccessModalProps> = ({ isOpen, onClose }) => {
  const { activeBusiness, grantAccessEmail, revokeAccessEmail, isAdmin } = useBusiness();
  const { profile } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const allowedEmails = activeBusiness?.allowedEmails || ['kunalqaz1@gmail.com'];

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (allowedEmails.map((em) => em.toLowerCase()).includes(clean)) {
      setErrorMsg('This email already has access to Anu Tools');
      return;
    }

    try {
      setLoading(true);
      await grantAccessEmail(clean);
      setSuccessMsg(`Access granted to ${clean}! They can now log in and access the business.`);
      setNewEmail('');
    } catch (err: unknown) {
      setErrorMsg('Failed to grant access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (email: string) => {
    if (email.toLowerCase() === 'kunalqaz1@gmail.com') {
      alert('The primary owner (kunalqaz1@gmail.com) cannot be removed.');
      return;
    }
    if (confirm(`Revoke access for ${email}?`)) {
      await revokeAccessEmail(email);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Team & Staff Access</h3>
              <p className="text-xs text-slate-400">Manage who can view and edit Anu Tools ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Add Email Form */}
          {isAdmin ? (
            <form onSubmit={handleGrant} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Give Access to Another Email
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="partner@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Grant</span>
                </button>
              </div>

              {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
              {successMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}
            </form>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
              Only the primary store owner (<span className="text-emerald-400 font-semibold">kunalqaz1@gmail.com</span>) can grant or revoke staff access.
            </div>
          )}

          {/* Current Authorized Users */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Authorized Users ({allowedEmails.length})
            </h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {allowedEmails.map((email) => {
                const isPrimary = email.toLowerCase() === 'kunalqaz1@gmail.com';
                const isCurrent = email.toLowerCase() === (profile?.email || '').toLowerCase();
                return (
                  <div
                    key={email}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0">
                        {email.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-200 truncate">{email}</p>
                        <p className="text-[10px] text-slate-400">
                          {isPrimary ? 'Store Owner (Super Admin)' : 'Authorized Staff'}
                          {isCurrent ? ' • You' : ''}
                        </p>
                      </div>
                    </div>

                    {isPrimary ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold shrink-0">
                        Primary Owner
                      </span>
                    ) : isAdmin ? (
                      <button
                        onClick={() => handleRevoke(email)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer shrink-0"
                        title="Revoke Access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

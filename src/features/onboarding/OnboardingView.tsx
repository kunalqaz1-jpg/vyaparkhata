import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { ShieldCheck, ShieldAlert, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { AnuToolsLogo } from '../../components/common/AnuToolsLogo';

export const OnboardingView: React.FC = () => {
  const { profile, user, loginWithGoogle, loginAsAdminDirectly, logout } = useAuth();
  const { isAuthorized, activeBusiness } = useBusiness();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(profile || user);
  const currentEmail = (profile?.email || user?.email || '').toLowerCase().trim();

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      setError('Google sign-in was closed or blocked. You can use the Quick Admin Sign-In below for instant access.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDirectLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await loginAsAdminDirectly();
    } catch (err: unknown) {
      console.error(err);
      setError('Could not sign in as admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Case 1: User is logged in, but not authorized for this store
  if (isAuthenticated && !isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 shadow-2xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              Access Restricted
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Unauthorized Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Anu Tools and Service Center is a private business. Access is strictly limited to <strong className="text-slate-800 dark:text-slate-200">kunalqaz1@gmail.com</strong> and authorized staff members.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-left space-y-1">
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Currently Signed In As</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{currentEmail}</p>
          </div>

          <p className="text-xs text-amber-600 dark:text-amber-400">
            Please ask the store owner (kunalqaz1@gmail.com) to grant you access, or sign in with an authorized account.
          </p>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => logout()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Switch Account</span>
            </button>

            <button
              onClick={handleAdminDirectLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign in as Admin (kunalqaz1@gmail.com)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Not logged in at all
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-center space-y-6">
        
        {/* Brand Logo */}
        <div className="w-20 h-20 rounded-2xl bg-white p-2.5 flex items-center justify-center mx-auto shadow-xl border border-slate-200 dark:border-slate-700">
          <AnuToolsLogo className="w-full h-full" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            Official Store Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Anu Tools & Service Center
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Please sign in to access your digital bahi-khata, customer balances, GST billing, and stock inventory.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 text-left">
            {error}
          </div>
        )}

        {/* Login Action Buttons */}
        <div className="space-y-3 pt-1">
          {/* Google Sign-in */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Admin Access Button for Presentation Day */}
          <button
            onClick={handleAdminDirectLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Sign-In (kunalqaz1@gmail.com)</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Protected Cloud Database: {activeBusiness?.name || 'Anu Tools'}</span>
          </p>
          <p className="text-[10px] text-slate-400">
            Primary Owner: kunalqaz1@gmail.com
          </p>
        </div>

      </div>
    </div>
  );
};

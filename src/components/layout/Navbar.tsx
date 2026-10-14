import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  Building2,
  LogOut,
  User,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Key,
  LogIn
} from 'lucide-react';
import { AnuToolsLogo } from '../common/AnuToolsLogo';

interface NavbarProps {
  onOpenNewTransaction: (defaultType?: 'you_gave' | 'you_got') => void;
  onOpenBusinessProfile: () => void;
  onOpenTeamAccess: () => void;
  onOpenSignIn: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTransaction,
  onOpenBusinessProfile,
  onOpenTeamAccess,
  onOpenSignIn,
  activeTab,
  setActiveTab,
}) => {
  const { profile, user, logout } = useAuth();
  const { activeBusiness, isAdmin } = useBusiness();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  // Close profile popup when tapping anywhere outside
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent | TouchEvent) => {
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('touchstart', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, [showProfileMenu]);

  const isAuthenticated = Boolean(profile || user);
  const displayEmail = profile?.email || user?.email || '';
  const displayName = profile?.displayName || user?.displayName || (displayEmail.includes('kunal') ? 'Kunal Merchant' : 'Staff');

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand & Single Business Badge */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Logo */}
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-700/60 group-hover:scale-105 transition-transform shrink-0">
                <AnuToolsLogo className="w-full h-full" />
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
                  ANU TOOLS
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-emerald-400 -mt-1">
                  Digital Bahi-Khata PWA
                </span>
              </div>
            </div>

            {/* Single Admin Business Badge - No Switcher */}
            {activeBusiness && (
              <button
                onClick={onOpenBusinessProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
                title="View Business Profile & Settings"
              >
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[200px] text-slate-100">
                  {activeBusiness.name}
                </span>
              </button>
            )}
          </div>

          {/* Center/Right Desktop Navigation Tabs */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'customers', label: 'Customers' },
                { id: 'suppliers', label: 'Suppliers' },
                { id: 'invoices', label: 'GST Invoices' },
                { id: 'products', label: 'Inventory' },
                { id: 'expenses', label: 'Expenses' },
                { id: 'reports', label: 'Reports' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Right Actions: Quick Entry, PWA install, Profile / Sign In */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick You Gave / You Got Buttons - Only when authenticated and business is active */}
            {isAuthenticated && activeBusiness && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => onOpenNewTransaction('you_gave')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white shadow-xs transition cursor-pointer"
                  title="Record money given / credit sale"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>You Gave</span>
                </button>
                <button
                  onClick={() => onOpenNewTransaction('you_got')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-xs transition cursor-pointer"
                  title="Record money received / payment"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>You Got</span>
                </button>
              </div>
            )}

            {/* In-App PWA Install Button */}
            <PWAInstallButton />

            {/* Profile / Account Dropdown OR Sign-in Button */}
            {isAuthenticated ? (
              <div className="relative" ref={profileContainerRef}>
                <button
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer transition focus:ring-2 focus:ring-emerald-500"
                  title="Account Menu"
                >
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </button>

                {showProfileMenu && (
                  <>
                    {/* Transparent full-screen backdrop to guarantee closing when tapped anywhere */}
                    <div
                      className="fixed inset-0 z-40 bg-black/10 cursor-default"
                      onClick={() => setShowProfileMenu(false)}
                      onTouchStart={() => setShowProfileMenu(false)}
                    />

                    {/* Profile Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-700/60">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-100 truncate">
                            {displayName}
                          </p>
                          {isAdmin ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 shrink-0">
                              Admin
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 shrink-0">
                              Staff
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {displayEmail}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenBusinessProfile();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition"
                        >
                          <Building2 className="w-4 h-4 text-emerald-400" />
                          <span>Business Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            setActiveTab('reports');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-100 hover:bg-slate-700/80 flex items-center justify-between cursor-pointer group transition"
                        >
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold">Reports & Statements</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                            P&L / Daybook
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenTeamAccess();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition"
                        >
                          <Key className="w-4 h-4 text-amber-400" />
                          <span>Team & Staff Access</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-700/60 pt-1 mt-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

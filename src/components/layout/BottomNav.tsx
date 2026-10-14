import React from 'react';
import {
  Home,
  Users,
  FileText,
  Package,
  Plus
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTransaction: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Home</span>
        </button>

        {/* Khata / Customers */}
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition ${
            activeTab === 'customers' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1">Khata</span>
        </button>

        {/* Center Prominent Record Button */}
        <div className="relative -top-4">
          <button
            onClick={onOpenNewTransaction}
            className="w-13 h-13 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 border-4 border-slate-900 cursor-pointer active:scale-95 transition-transform"
            title="Record New Transaction"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Invoices */}
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition ${
            activeTab === 'invoices' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-1">Bills</span>
        </button>

        {/* Inventory / Stock */}
        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition ${
            activeTab === 'products' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-1">Stock</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Product } from '../../types';
import { formatINR } from '../../lib/formatters';
import {
  Package,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  X,
  Tag,
  DollarSign
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProductStock } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('General Goods');
  const [unit, setUnit] = useState('pcs');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract unique categories
  const categories = Array.from(new Set(products.map((p) => p.category || 'General')));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  const totalStockValuation = products.reduce(
    (sum, p) => sum + (p.currentStock * p.purchasePrice),
    0
  );

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await addProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category: category.trim(),
        unit: unit.trim(),
        purchasePrice: Number(purchasePrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        currentStock: Number(currentStock) || 0,
        minStockAlert: Number(minStockAlert) || 5,
        taxRate: Number(taxRate) || 0,
      });
      setShowAddModal(false);
      setName('');
      setSku('');
      setPurchasePrice(0);
      setSellingPrice(0);
      setCurrentStock(0);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add product.');
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
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Products & Inventory ({products.length})
            </h1>
            <p className="text-xs text-slate-500">
              Total Stock Valuation: <span className="font-bold text-slate-900 dark:text-white">{formatINR(totalStockValuation)}</span> • Low Stock Items: <span className={`font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>{lowStockCount}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search product by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No products in inventory</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add products with selling price and purchase cost to auto-calculate stock value and bill items quickly.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
            >
              + Add First Product
            </button>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLowStock = p.currentStock <= p.minStockAlert;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 p-4 rounded-xl shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        {p.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                        {p.name}
                      </h3>
                      {p.sku && (
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                      )}
                    </div>

                    {isLowStock && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Low</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-y border-slate-100 dark:border-slate-800 py-2">
                    <div>
                      <p className="text-[10px] text-slate-400">Sale Price</p>
                      <p className="font-bold text-slate-900 dark:text-white">{formatINR(p.sellingPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Cost Price</p>
                      <p className="font-semibold text-slate-600 dark:text-slate-400">{formatINR(p.purchasePrice)}</p>
                    </div>
                  </div>
                </div>

                {/* Stock Controls */}
                <div className="mt-3 flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">In Stock: </span>
                    <span className={`text-sm font-black ${isLowStock ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                      {p.currentStock} {p.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateProductStock(p.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                      title="Stock Out (-1)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateProductStock(p.id, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center transition cursor-pointer"
                      title="Stock In (+1)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateProductStock(p.id, 10)}
                      className="px-1.5 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white text-[11px] font-bold flex items-center justify-center transition cursor-pointer"
                      title="Quick Stock In (+10)"
                    >
                      +10
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-scale-up">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold">Add Product to Inventory</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-4 sm:p-6 space-y-3.5">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product / Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortune Sunflower Oil 1L"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Staples, Edible Oil"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SKU / Barcode (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OIL-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="pcs / kg / pkt"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentStock || ''}
                    onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Min Stock Alert
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={minStockAlert || ''}
                    onChange={(e) => setMinStockAlert(parseFloat(e.target.value) || 5)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GST Rate %
                  </label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
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
                  {isSubmitting ? 'Saving...' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

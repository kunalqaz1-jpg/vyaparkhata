import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { InvoiceItem } from '../../types';
import { formatINR } from '../../lib/formatters';
import { Plus, Trash2, X, Calculator, Receipt } from 'lucide-react';

interface InvoiceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (invoiceId: string) => void;
}

export const InvoiceBuilderModal: React.FC<InvoiceBuilderModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
}) => {
  const { customers, products, createInvoice, activeBusiness } = useBusiness();

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Payment requested within 7 days. Thank you for your business!');
  
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item_1',
      name: '',
      quantity: 1,
      unit: 'pcs',
      rate: 0,
      taxRate: 18,
      amount: 0,
    },
  ]);

  const [discountTotal, setDiscountTotal] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerAddress(found.address || '');
      setCustomerGstin(found.gstin || '');
    }
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const newItems = [...items];
    const qty = newItems[index].quantity || 1;
    const rate = prod.sellingPrice || 0;
    const taxRate = prod.taxRate || 0;
    const taxable = qty * rate;
    const tax = (taxable * taxRate) / 100;

    newItems[index] = {
      ...newItems[index],
      productId: prod.id,
      name: prod.name,
      unit: prod.unit || 'pcs',
      rate: rate,
      taxRate: taxRate,
      amount: taxable + tax,
    };
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const updated = { ...newItems[index], [field]: value };
    const qty = Number(updated.quantity) || 0;
    const rate = Number(updated.rate) || 0;
    const taxRate = Number(updated.taxRate) || 0;
    const taxable = qty * rate;
    const tax = (taxable * taxRate) / 100;
    updated.amount = taxable + tax;
    newItems[index] = updated;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: 'item_' + Date.now(),
        name: '',
        quantity: 1,
        unit: 'pcs',
        rate: 0,
        taxRate: 18,
        amount: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Tax and total calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxTotal = items.reduce((sum, item) => sum + ((item.quantity * item.rate * item.taxRate) / 100), 0);
  const totalAmount = Math.max(0, subtotal + taxTotal - (discountTotal || 0));
  const cgst = taxTotal / 2;
  const sgst = taxTotal / 2;
  const igst = 0;
  const balanceDue = Math.max(0, totalAmount - (paidAmount || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Please specify customer name.');
      return;
    }
    if (items.some((it) => !it.name.trim() || it.rate <= 0)) {
      setErrorMsg('Please ensure all items have a description and valid price rate.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      let status: 'draft' | 'unpaid' | 'partially_paid' | 'paid' = 'unpaid';
      if (paidAmount >= totalAmount && totalAmount > 0) {
        status = 'paid';
      } else if (paidAmount > 0) {
        status = 'partially_paid';
      }

      const inv = await createInvoice({
        invoiceNumber,
        customerId: customerId || 'guest_cust',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerGstin: customerGstin.trim(),
        items,
        subtotal,
        discountTotal,
        taxTotal,
        cgst,
        sgst,
        igst,
        totalAmount,
        paidAmount,
        balanceDue,
        status,
        issueDate,
        dueDate,
        notes,
      });

      if (inv) {
        onInvoiceCreated(inv.id);
        onClose();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-scale-up">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-black tracking-tight">Create GST Sales Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Top row: Invoice Number, Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bill To (Customer Information)
              </span>
              <select
                value={customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">-- Or Select Existing Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Customer Full Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Customer Address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Customer GSTIN (Optional)"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Line Items
              </span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-wrap md:flex-nowrap items-center gap-2"
                >
                  {/* Select product from catalog or custom input */}
                  <div className="w-full md:w-5/12">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        required
                        placeholder="Item / Service description *"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      {products.length > 0 && (
                        <select
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="w-24 px-1 py-1.5 text-[11px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        >
                          <option value="">Stock...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (₹{p.sellingPrice})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                    />
                  </div>

                  {/* Unit */}
                  <div className="w-20">
                    <input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center"
                    />
                  </div>

                  {/* Rate */}
                  <div className="w-28">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="Rate ₹"
                      value={item.rate || ''}
                      onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  {/* GST Tax % */}
                  <div className="w-24">
                    <select
                      value={item.taxRate}
                      onChange={(e) => handleItemChange(idx, 'taxRate', parseFloat(e.target.value))}
                      className="w-full px-1.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="0">0% (Nil)</option>
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST</option>
                      <option value="28">28% GST</option>
                    </select>
                  </div>

                  {/* Amount with tax */}
                  <div className="w-28 text-right font-black text-xs text-slate-800 dark:text-slate-100">
                    {formatINR(item.amount)}
                  </div>

                  {/* Remove action */}
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary & Settlement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Terms & Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Calculations Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal (Taxable):</span>
                <span className="font-semibold">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total GST (CGST + SGST):</span>
                <span className="font-semibold">{formatINR(taxTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={discountTotal || ''}
                  onChange={(e) => setDiscountTotal(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-0.5 text-xs text-right rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold"
                  placeholder="0"
                />
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm font-black text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatINR(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1">
                <span>Amount Paid Now (₹):</span>
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-28 px-2 py-0.5 text-xs text-right rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-600 dark:text-rose-400 pt-1">
                <span>Balance Due (Udhar):</span>
                <span>{formatINR(balanceDue)}</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Invoice...' : 'Generate & Save Invoice'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

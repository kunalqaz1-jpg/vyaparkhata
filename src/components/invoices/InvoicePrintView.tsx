import React from 'react';
import { Invoice, Business } from '../../types';
import { formatINR, formatDate } from '../../lib/formatters';
import { Printer, Download, X, CheckCircle, QrCode } from 'lucide-react';

interface InvoicePrintViewProps {
  invoice: Invoice | null;
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({
  invoice,
  business,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        
        {/* Modal Controls (Hidden when printing) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Tax Invoice Preview</span>
            <span className="font-mono text-sm font-bold text-white">#{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 sm:p-10 text-slate-900 bg-white print:p-0 print:m-0" id="printable-invoice">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {business?.name || 'Vyapar Business Store'}
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                {business?.address || 'Main Market, India'}
              </p>
              <p className="text-xs text-slate-600">
                Phone: <span className="font-semibold">{business?.phone}</span>
              </p>
              {business?.gstin && (
                <p className="text-xs font-mono font-bold text-indigo-900 mt-0.5">
                  GSTIN: {business.gstin}
                </p>
              )}
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white text-xs font-black uppercase tracking-wider mb-2">
                TAX INVOICE
              </span>
              <p className="text-xs text-slate-600">
                Invoice No: <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
              </p>
              <p className="text-xs text-slate-600">
                Date: <span className="font-semibold text-slate-900">{formatDate(invoice.issueDate)}</span>
              </p>
              {invoice.dueDate && (
                <p className="text-xs text-slate-600">
                  Due Date: <span className="font-semibold text-slate-900">{formatDate(invoice.dueDate)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                BILLED TO (BUYER)
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-1">{invoice.customerName}</h2>
              {invoice.customerPhone && (
                <p className="text-slate-600">Phone: {invoice.customerPhone}</p>
              )}
              {invoice.customerAddress && (
                <p className="text-slate-600">{invoice.customerAddress}</p>
              )}
              {invoice.customerGstin && (
                <p className="font-mono font-bold text-indigo-900 mt-0.5">
                  GSTIN: {invoice.customerGstin}
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                PAYMENT STATUS
              </span>
              <div className="mt-1">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    invoice.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : invoice.status === 'partially_paid'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {invoice.status.replace('_', ' ')}
                </span>
              </div>
              {invoice.balanceDue > 0 && (
                <p className="text-xs text-rose-600 font-bold mt-1">
                  Amount Due: {formatINR(invoice.balanceDue)}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px]">
                  <th className="py-2 w-8">#</th>
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center w-16">Qty</th>
                  <th className="py-2 text-right w-20">Rate</th>
                  <th className="py-2 text-center w-16">GST %</th>
                  <th className="py-2 text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="text-slate-800">
                    <td className="py-2.5 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 font-semibold text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-2.5 text-center font-bold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2.5 text-right font-medium">
                      {formatINR(item.rate)}
                    </td>
                    <td className="py-2.5 text-center text-slate-600">
                      {item.taxRate}%
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {formatINR(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              {business?.upiId && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <QrCode className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">Scan & Pay via UPI</p>
                    <p className="font-mono text-[11px] text-slate-600">{business.upiId}</p>
                    <p className="text-[10px] text-slate-400">GooglePay / PhonePe / Paytm</p>
                  </div>
                </div>
              )}
              {invoice.notes && (
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Notes & Terms: </span>
                  <span>{invoice.notes}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-0.5">
                <span>Subtotal (Taxable Value):</span>
                <span className="font-semibold">{formatINR(invoice.subtotal)}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between py-0.5 text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span>-{formatINR(invoice.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between py-0.5">
                <span>CGST:</span>
                <span className="font-semibold">{formatINR(invoice.cgst)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>SGST:</span>
                <span className="font-semibold">{formatINR(invoice.sgst)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                <span>Grand Total:</span>
                <span>{formatINR(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-emerald-700 font-semibold">
                <span>Amount Paid:</span>
                <span>{formatINR(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-rose-600 font-bold border-t border-slate-200 pt-1">
                <span>Balance Due:</span>
                <span>{formatINR(invoice.balanceDue)}</span>
              </div>
            </div>
          </div>

          {/* Footer signature */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Thank you for your valuable patronage!</p>
              <p className="text-[10px]">Computer generated invoice via VyaparKhata PWA</p>
            </div>
            <div className="text-center w-40">
              <div className="h-10 border-b border-slate-400" />
              <p className="mt-1 font-bold text-slate-800">Authorised Signatory</p>
              <p className="text-[10px] text-slate-500">{business?.name}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

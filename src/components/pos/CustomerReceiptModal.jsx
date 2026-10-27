import React from 'react';
import { Printer, X, Check, UtensilsCrossed } from 'lucide-react';

export default function CustomerReceiptModal({ isOpen, onClose, order, tenant, settings }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" id="customer-receipt-modal">
      <style>{`
        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #customer-receipt-modal,
          #customer-receipt-modal #customer-receipt,
          #customer-receipt-modal #customer-receipt * {
            visibility: visible !important;
          }
          #customer-receipt-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            display: block !important;
          }
          #customer-receipt-modal > div {
            box-shadow: none !important;
            border: none !important;
            max-height: unset !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Actions */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Struk Pelanggan (Customer Receipt)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="customer-receipt" className="p-6 overflow-y-auto font-mono text-[11px] text-slate-800 leading-tight space-y-3 bg-white">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="font-bold text-base font-sans text-slate-900 tracking-tight">
              {tenant?.name || 'Restoran Berkah Nusantara'}
            </h2>
            <p className="text-[10px] text-slate-500">{tenant?.branch || 'Cabang Utama'}</p>
            {tenant?.address && <p className="text-[10px] text-slate-500">{tenant.address}</p>}
            {tenant?.phone && <p className="text-[10px] text-slate-500">Telp: {tenant.phone}</p>}
          </div>

          <div className="border-t border-dashed border-slate-300 my-2"></div>

          {/* Meta Info */}
          <div className="space-y-0.5 text-[10px] text-slate-600">
            <div className="flex justify-between">
              <span>No. Nota:</span>
              <span className="font-bold text-slate-900">{order.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu:</span>
              <span>
                {new Date(order.created_at).toLocaleDateString('id-ID')} {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{order.cashier_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span>{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Layanan:</span>
              <span className="font-bold uppercase text-slate-900">
                {order.order_type === 'dine_in' ? `DINE-IN ${order.table_number ? `(Meja ${order.table_number})` : ''}` : 'TAKEAWAY (BUNGKUS)'}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 my-2"></div>

          {/* Items */}
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-semibold">
                  <span>{item.name}</span>
                  <span>Rp {Number(item.subtotal).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{item.quantity}x @ Rp {Number(item.price).toLocaleString('id-ID')}</span>
                  {item.portion && item.portion !== 'Standard' && (
                    <span className="italic">[{item.portion}]</span>
                  )}
                </div>
                {item.notes && (
                  <div className="text-[10px] text-amber-700 italic">
                    * Catatan: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 my-2"></div>

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
            </div>
            {order.service_fee > 0 && (
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>Biaya Layanan Dine-In:</span>
                <span>Rp {Number(order.service_fee).toLocaleString('id-ID')}</span>
              </div>
            )}
            {order.packaging_fee > 0 && (
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>Biaya Kemasan Takeaway:</span>
                <span>Rp {Number(order.packaging_fee).toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL:</span>
              <span>Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 my-2"></div>

          {/* Payment */}
          <div className="space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span>Metode:</span>
              <span className="uppercase font-semibold">{order.payment_method}</span>
            </div>
            {order.payment_method === 'cash' ? (
              <>
                <div className="flex justify-between">
                  <span>Tunai Diterima:</span>
                  <span>Rp {Number(order.cash_amount).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Kembalian:</span>
                  <span>Rp {Number(order.change_amount).toLocaleString('id-ID')}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Status:</span>
                <span>LUNAS (QRIS)</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-slate-300 my-2"></div>

          {/* Footer message from store settings */}
          <div className="text-center text-[10px] text-slate-500 pt-1 space-y-1">
            <p>{tenant?.receipt_footer || 'Terima kasih atas kunjungan Anda! Selamat menikmati hidangan kami.'}</p>
            <p className="text-[9px] text-slate-400">KasirKu Digital System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

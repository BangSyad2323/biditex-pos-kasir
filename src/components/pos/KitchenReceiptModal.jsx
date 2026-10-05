import React from 'react';
import { ChefHat, Printer, X } from 'lucide-react';

export default function KitchenReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Actions */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50 print:hidden">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <ChefHat className="w-4 h-4 text-amber-600" />
            <span>Tiket Order Dapur (Kitchen Ticket)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dapur</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Kitchen Ticket (TANPA NOMINAL HARGA SESUAI SPESIFIKASI) */}
        <div id="kitchen-ticket" className="p-6 overflow-y-auto font-mono text-slate-900 leading-tight space-y-4 bg-white">
          {/* Header Dapur */}
          <div className="text-center pb-2 border-b-2 border-black">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-500">PESANAN DAPUR</span>
            <div className="text-3xl font-black font-sans my-1 tracking-tight">
              ANTREAN #{order.queue_number || '1'}
            </div>
            <div className="text-xs text-slate-600">
              Nota: {order.invoice_number}
            </div>
          </div>

          {/* Tipe Pesanan Font Besar */}
          <div className="bg-slate-100 p-3 rounded-lg text-center border border-slate-300">
            <div className="text-xl font-extrabold uppercase tracking-wider text-slate-900">
              {order.order_type === 'dine_in' ? '🍽️ DINE-IN' : '🥡 TAKEAWAY (BUNGKUS)'}
            </div>
            {order.table_number && (
              <div className="text-base font-bold text-amber-700 mt-1">
                MEJA: {order.table_number}
              </div>
            )}
            <div className="text-xs text-slate-600 mt-0.5">
              Pelanggan: {order.customer_name}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex justify-between border-b border-dashed border-slate-300 pb-2">
            <span>Waktu Order:</span>
            <span>
              {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Menu Items + Qty + Catatan (TANPA HARGA) */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              DAFTAR MASAKAN / MINUMAN:
            </div>
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-start justify-between">
                  <div className="text-sm font-bold text-slate-900 leading-snug">
                    {item.name}
                  </div>
                  <div className="text-base font-black text-slate-900 bg-amber-200/80 px-2 py-0.5 rounded ml-2">
                    {item.quantity}x
                  </div>
                </div>

                {item.portion && item.portion !== 'Standard' && (
                  <div className="text-xs font-semibold text-slate-700">
                    Porsi: {item.portion}
                  </div>
                )}

                {item.notes ? (
                  <div className="text-xs font-bold text-rose-600 bg-rose-50 p-1.5 rounded border border-rose-200">
                    ⚠️ {item.notes}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    Tanpa catatan khusus
                  </div>
                )}
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800">
              <span className="font-bold">Catatan Umum:</span> {order.notes}
            </div>
          )}

          <div className="border-t-2 border-black pt-2 text-center text-[10px] text-slate-400">
            *** TIKET DAPUR / KITCHEN ONLY - TANPA NOMINAL HARGA ***
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function DualReceiptPrintModal({
  isOpen,
  onClose,
  order,
  tenant,
  settings,
}) {
  if (!isOpen || !order) return null;

  const isOnline = order.order_type === "online";

  return (
    <div
      id="dual-receipt-print-wrapper"
      className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999]"
    >
      <style>{`
        @media print {
          /* Reset page */
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide EVERYTHING by default */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the dual receipt wrapper and ALL its descendants */
          #dual-receipt-print-wrapper,
          #dual-receipt-print-wrapper * {
            visibility: visible !important;
          }
          /* Position the receipt wrapper to fill the page */
          #dual-receipt-print-wrapper {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          /* Page break between customer and kitchen receipts */
          .receipt-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          /* Ensure modals, overlays, nav bars, etc don't interfere */
          .fixed:not(#dual-receipt-print-wrapper),
          [class*="bottom-nav"],
          nav,
          header {
            display: none !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* SECTION 1: STRUK PELANGGAN (CUSTOMER RECEIPT)                              */}
      {/* ========================================================================= */}
      <div className="receipt-page-break p-4 max-w-[80mm] mx-auto font-mono text-[11px] text-slate-900 leading-tight space-y-3 bg-white">
        {/* Header Toko */}

        {isOnline && order.online_order_id && (
            <div className="flex justify-between font-bold text-slate-900">
          
              <span>{order.online_order_id}</span>
            </div>
          )}
        <div className="text-center space-y-1">
          <h2 className="font-bold text-sm font-sans text-slate-900 tracking-tight">
            {tenant?.name || "Restoran Berkah Nusantara"}
          </h2>
          <p className="text-[10px] text-slate-600">
            {tenant?.branch || "Cabang Utama"}
          </p>
          {tenant?.address && (
            <p className="text-[10px] text-slate-600">{tenant.address}</p>
          )}
          {tenant?.phone && (
            <p className="text-[10px] text-slate-600">Telp: {tenant.phone}</p>
          )}
        </div>

        <div className="border-t border-dashed border-slate-400 my-2"></div>

        

        {/* Meta Info */}
        <div className="space-y-0.5 text-[10px] text-slate-700">
          <div className="flex justify-between">
            <span>No. Nota:</span>
            <span className="font-bold text-slate-900">
              {order.invoice_number}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Waktu:</span>
            <span>
              {new Date(order.created_at).toLocaleDateString("id-ID")}{" "}
              {new Date(order.created_at).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>{order.cashier_name}</span>
          </div>

          <div className="flex justify-between">
            <span>{isOnline ? "Driver / Pemesan:" : "Pelanggan:"}</span>
            <span className="font-bold text-slate-900">
              {order.customer_name}
            </span>
          </div>

          

          <div className="flex justify-between">
            <span>Layanan:</span>
            <span className="font-bold uppercase text-slate-900">
              {order.order_type === "dine_in"
                ? `DINE-IN ${order.table_number ? `(Meja ${order.table_number})` : ""}`
                : order.order_type === "takeaway"
                  ? "TAKEAWAY (BUNGKUS)"
                  : `ONLINE (${order.online_channel || "DELIVERY"})`}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-400 my-2"></div>

        {/* Items */}
        <div className="space-y-2">
          {order.items?.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between font-semibold">
                <span>{item.name}</span>
                <span>Rp {Number(item.subtotal).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>
                  {item.quantity}x @ Rp{" "}
                  {Number(item.price).toLocaleString("id-ID")}
                </span>
                {item.portion && item.portion !== "Standard" && (
                  <span className="italic">[{item.portion}]</span>
                )}
              </div>
              {item.notes && (
                <div className="text-[10px] text-slate-700 italic">
                  * Catatan: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-slate-400 my-2"></div>

        {/* Totals */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rp {Number(order.subtotal).toLocaleString("id-ID")}</span>
          </div>

          {order.service_fee > 0 && (
            <div className="flex justify-between text-[10px] text-slate-700">
              <span>Biaya Layanan Dine-In:</span>
              <span>
                Rp {Number(order.service_fee).toLocaleString("id-ID")}
              </span>
            </div>
          )}

          {order.packaging_fee > 0 && (
            <div className="flex justify-between text-[10px] text-slate-700">
              <span>Biaya Kemasan Takeaway:</span>
              <span>
                Rp {Number(order.packaging_fee).toLocaleString("id-ID")}
              </span>
            </div>
          )}

          <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
            <span>TOTAL:</span>
            <span>Rp {Number(order.total_amount).toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-400 my-2"></div>

        {/* Payment */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>Metode:</span>
            <span className="uppercase font-semibold">
              {isOnline
                ? `${order.online_channel || "ONLINE"} (NON-TUNAI)`
                : order.payment_method}
            </span>
          </div>

          {order.payment_method === "cash" ? (
            <>
              <div className="flex justify-between">
                <span>Tunai Diterima:</span>
                <span>
                  Rp {Number(order.cash_amount).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>Kembalian:</span>
                <span>
                  Rp {Number(order.change_amount).toLocaleString("id-ID")}
                </span>
              </div>
            </>
          ) : isOnline || order.payment_method === "online_platform" ? (
            <div className="flex justify-between font-bold text-slate-900">
              <span>Status:</span>
              <span>LUNAS (SALDO PLATFORM)</span>
            </div>
          ) : (
            <div className="flex justify-between font-semibold">
              <span>Status:</span>
              <span>LUNAS (QRIS)</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-slate-400 my-2"></div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-600 pt-1 space-y-1">
          <p>
            {tenant?.receipt_footer ||
              "Terima kasih atas kunjungan Anda! Selamat menikmati hidangan kami."}
          </p>
          <p className="text-[9px] text-slate-500">KasirKu Digital System</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: STRUK DAPUR (KITCHEN TICKET)                                    */}
      {/* ========================================================================= */}
      <div className="p-4 max-w-[80mm] mx-auto font-mono text-slate-900 leading-tight space-y-4 bg-white">
        {/* Header Dapur */}
        <div className="text-center pb-2 border-b-2 border-black">
          <div className="text-sm uppercase font-bold tracking-widest text-slate-900">
            *** NOTA DAPUR ***
          </div>
          <div className="text-2xl font-black font-sans my-1 tracking-tight">
            ANTREAN #{order.queue_number || "1"}
          </div>
          <div className="text-xs text-slate-700">
            Nota: {order.invoice_number}
          </div>
        </div>

        {/* Tipe Pesanan */}
        <div className="p-2.5 text-center border-2 border-black">
          <div className="text-base font-black uppercase tracking-wider text-slate-900">
            {order.order_type === "dine_in"
              ? "🍽️ DINE-IN"
              : order.order_type === "takeaway"
                ? "🥡 TAKEAWAY (BUNGKUS)"
                : `🛵 ONLINE (${order.online_channel || "DELIVERY"})`}
          </div>

          {order.table_number && (
            <div className="text-sm font-bold text-slate-900 mt-1">
              MEJA: {order.table_number}
            </div>
          )}

          {isOnline && order.online_order_id && (
            <div className="text-xs font-bold text-slate-900 mt-1">
              RESI: {order.online_order_id}
            </div>
          )}

          <div className="text-xs text-slate-800 mt-0.5">
            {isOnline ? "Driver:" : "Pelanggan:"} {order.customer_name}
          </div>
        </div>

        <div className="text-[11px] text-slate-700 flex justify-between border-b border-dashed border-slate-400 pb-2">
          <span>Waktu Order:</span>
          <span>
            {new Date(order.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Menu Items + Qty + Catatan (TANPA NOMINAL HARGA) */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
            DAFTAR PESANAN MASAKAN:
          </div>
          {order.items?.map((item, idx) => (
            <div key={idx} className="p-2 space-y-1 border-b border-slate-300">
              <div className="flex items-start justify-between">
                <div className="text-sm font-bold text-slate-900 leading-snug">
                  {item.name}
                </div>
                <div className="text-base font-black text-slate-900 px-2 py-0.5 border border-black ml-2">
                  {item.quantity}x
                </div>
              </div>
              {item.portion && item.portion !== "Standard" && (
                <div className="text-xs font-semibold text-slate-800">
                  Porsi: {item.portion}
                </div>
              )}
              {item.notes ? (
                <div className="text-xs font-bold text-slate-900 p-1 border border-black">
                  ⚠️ Catatan: {item.notes}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="p-2 border border-black text-xs font-medium text-slate-900">
            <span className="font-bold">Catatan Umum:</span> {order.notes}
          </div>
        )}

        <div className="border-t-2 border-black pt-2 text-center text-[10px] text-slate-700">
          *** TIKET DAPUR / KITCHEN ONLY - TANPA NOMINAL HARGA ***
        </div>
      </div>
    </div>
  );
}

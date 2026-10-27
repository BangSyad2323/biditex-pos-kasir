import React from 'react';
import { AlertCircle, QrCode } from 'lucide-react';

export default function StaticQrisCard({ tenant, settings, grandTotal }) {
  const storeName = tenant?.name || 'KASIRKU DIGITAL';
  const nmid = settings?.nmid || tenant?.nmid || 'ID1020039281728';
  const qrisImage = settings?.qris_image_url || settings?.qris_image || tenant?.qris_image_url || tenant?.qris_image;

  return (
    <div className="space-y-3 pt-1">
      {/* Kartu QRIS Statis */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden text-center">
        {/* Banner Header Standar QRIS */}
        <div className="bg-white px-4 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xl tracking-tighter text-rose-600">Q<span className="text-slate-900">RIS</span></span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-600 block">
              Standar Pembayaran Nasional
            </span>
            <span className="text-[8px] text-slate-400 font-medium">GPN & Bank Indonesia</span>
          </div>
        </div>

        {/* Info Merchant / Toko */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
          <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-800 truncate">
            {storeName}
          </h4>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
            NMID: {nmid}
          </p>
        </div>

        {/* Gambar / Barcode QR Code */}
        <div className="p-4 flex flex-col items-center justify-center bg-white">
          {qrisImage ? (
            <img
              src={qrisImage}
              alt="QRIS Toko"
              className="max-h-52 max-w-[200px] w-full object-contain mx-auto rounded-lg shadow-xs"
            />
          ) : (
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs">
              {/* Standar SVG Placeholder QRIS Statis Beresolusi Tinggi */}
              <svg
                viewBox="0 0 160 160"
                className="w-40 h-40 mx-auto"
                shapeRendering="crispEdges"
              >
                <rect width="160" height="160" fill="white" />
                
                {/* Outer Top-Left Finder */}
                <rect x="10" y="10" width="35" height="35" fill="#0f172a" rx="4" />
                <rect x="15" y="15" width="25" height="25" fill="white" rx="2" />
                <rect x="20" y="20" width="15" height="15" fill="#0f172a" rx="2" />

                {/* Outer Top-Right Finder */}
                <rect x="115" y="10" width="35" height="35" fill="#0f172a" rx="4" />
                <rect x="120" y="15" width="25" height="25" fill="white" rx="2" />
                <rect x="125" y="20" width="15" height="15" fill="#0f172a" rx="2" />

                {/* Outer Bottom-Left Finder */}
                <rect x="10" y="115" width="35" height="35" fill="#0f172a" rx="4" />
                <rect x="15" y="120" width="25" height="25" fill="white" rx="2" />
                <rect x="20" y="125" width="15" height="15" fill="#0f172a" rx="2" />

                {/* Alignment Pattern */}
                <rect x="115" y="115" width="25" height="25" fill="#0f172a" rx="3" />
                <rect x="120" y="120" width="15" height="15" fill="white" rx="2" />
                <rect x="125" y="125" width="5" height="5" fill="#0f172a" />

                {/* Timing patterns & simulated data matrix cells */}
                <g fill="#0f172a">
                  {/* Horizontal / Vertical Timing */}
                  <rect x="50" y="24" width="5" height="5" />
                  <rect x="60" y="24" width="5" height="5" />
                  <rect x="70" y="24" width="5" height="5" />
                  <rect x="80" y="24" width="5" height="5" />
                  <rect x="90" y="24" width="5" height="5" />
                  <rect x="100" y="24" width="5" height="5" />

                  <rect x="24" y="50" width="5" height="5" />
                  <rect x="24" y="60" width="5" height="5" />
                  <rect x="24" y="70" width="5" height="5" />
                  <rect x="24" y="80" width="5" height="5" />
                  <rect x="24" y="90" width="5" height="5" />
                  <rect x="24" y="100" width="5" height="5" />

                  {/* Dense Data Dots (Quadrants) */}
                  <rect x="50" y="10" width="5" height="10" />
                  <rect x="65" y="10" width="10" height="5" />
                  <rect x="85" y="10" width="5" height="10" />
                  <rect x="100" y="15" width="10" height="5" />

                  <rect x="10" y="50" width="10" height="5" />
                  <rect x="10" y="65" width="5" height="10" />
                  <rect x="10" y="85" width="10" height="5" />
                  <rect x="15" y="100" width="5" height="10" />

                  {/* Central Body Data */}
                  <rect x="40" y="40" width="10" height="10" />
                  <rect x="55" y="40" width="5" height="5" />
                  <rect x="65" y="35" width="10" height="10" />
                  <rect x="80" y="40" width="15" height="5" />
                  <rect x="100" y="40" width="5" height="10" />

                  <rect x="35" y="55" width="10" height="5" />
                  <rect x="50" y="50" width="10" height="10" />
                  <rect x="65" y="55" width="5" height="10" />
                  <rect x="75" y="50" width="10" height="10" />
                  <rect x="90" y="55" width="10" height="5" />
                  <rect x="105" y="50" width="10" height="10" />
                  <rect x="120" y="55" width="15" height="5" />
                  <rect x="140" y="50" width="5" height="10" />

                  <rect x="35" y="70" width="15" height="5" />
                  <rect x="55" y="65" width="10" height="10" />
                  <rect x="70" y="70" width="5" height="5" />
                  <rect x="80" y="65" width="10" height="10" />
                  <rect x="95" y="70" width="15" height="5" />
                  <rect x="115" y="65" width="10" height="10" />
                  <rect x="135" y="70" width="10" height="5" />

                  <rect x="40" y="85" width="10" height="10" />
                  <rect x="55" y="80" width="5" height="10" />
                  <rect x="65" y="85" width="15" height="5" />
                  <rect x="85" y="80" width="10" height="10" />
                  <rect x="100" y="85" width="10" height="10" />
                  <rect x="115" y="80" width="5" height="10" />
                  <rect x="125" y="85" width="15" height="5" />
                  <rect x="145" y="80" width="5" height="10" />

                  <rect x="35" y="100" width="10" height="5" />
                  <rect x="50" y="95" width="10" height="10" />
                  <rect x="65" y="100" width="5" height="10" />
                  <rect x="75" y="95" width="15" height="5" />
                  <rect x="95" y="100" width="10" height="5" />
                  <rect x="110" y="95" width="10" height="10" />
                  <rect x="130" y="100" width="15" height="5" />

                  <rect x="50" y="110" width="10" height="10" />
                  <rect x="65" y="115" width="10" height="5" />
                  <rect x="80" y="110" width="15" height="10" />
                  <rect x="100" y="115" width="10" height="5" />

                  <rect x="50" y="125" width="15" height="5" />
                  <rect x="70" y="125" width="10" height="10" />
                  <rect x="85" y="130" width="15" height="5" />
                  <rect x="105" y="125" width="5" height="10" />

                  <rect x="55" y="140" width="10" height="10" />
                  <rect x="70" y="145" width="15" height="5" />
                  <rect x="90" y="140" width="10" height="10" />
                  <rect x="105" y="145" width="10" height="5" />
                </g>

                {/* Center QRIS Badge Icon */}
                <rect x="66" y="66" width="28" height="28" fill="white" rx="4" />
                <rect x="68" y="68" width="24" height="24" fill="#be123c" rx="3" />
                <text x="80" y="83" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">QRIS</text>
              </svg>
            </div>
          )}

          {/* Nominal Transfer Highlight */}
          <div className="mt-2.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold">
            Tagihan: Rp {Number(grandTotal).toLocaleString('id-ID')}
          </div>
        </div>

        {/* Footer Supported Networks */}
        <div className="px-3 py-1.5 bg-slate-100/80 border-t border-slate-200 text-[9px] font-semibold text-slate-500 uppercase tracking-tight">
          BCA • Mandiri • BRI • BNI • GoPay • OVO • DANA • ShopeePay
        </div>
      </div>

      {/* Petunjuk Ringkas Wajib Sesuai Instruksi User */}
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-left">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-amber-950">Petunjuk Pembayaran QRIS:</p>
          <p className="text-[11px] text-amber-900 mt-0.5">
            Scan QRIS di atas, lalu pastikan nominal transfer sudah sesuai sebelum menyelesaikan transaksi.
          </p>
        </div>
      </div>
    </div>
  );
}

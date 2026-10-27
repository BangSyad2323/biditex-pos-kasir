import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { TrendingUp, DollarSign, ShoppingBag } from "lucide-react";

// Recharts imports
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Bar,
} from "recharts";

// Format lengkap untuk Tooltip
const formatRupiah = (num) => "Rp " + Number(num || 0).toLocaleString("id-ID");

// Format ringkas khusus Label Sumbu Y
const formatRupiahCompact = (num) => {
  const val = Number(num || 0);
  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)}M`;
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}Jt`;
  if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}rb`;
  return `Rp ${val}`;
};

// Format ringkas label tanggal jika formatnya YYYY-MM-DD
const formatDateLabel = (label) => {
  if (!label) return "";
  // Jika label berformat YYYY-MM-DD (misal: 2026-10-27 -> ubah jadi 27/10)
  if (typeof label === "string" && label.includes("-") && label.length === 10) {
    const parts = label.split("-");
    return `${parts[2]}/${parts[1]}`;
  }
  return label;
};

export default function AnalyticsScreen() {
  const { isOwner } = useAuth();
  const [period, setPeriod] = useState("daily"); // daily | monthly | yearly | custom
  const [viewType, setViewType] = useState("omzet"); // 'omzet' | 'transaksi'
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Build query parameters based on period
  const buildParams = () => {
    const params = { period };
    if (period === "custom") {
      if (customStart) params.start_date = customStart;
      if (customEnd) params.end_date = customEnd;
    }
    return params;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/reports/sales-chart", {
        params: buildParams(),
      });
      setData(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load analytics data", err);
      setError(err.response?.data?.message || "Gagal memuat data analitik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOwner) return;
    if (period !== "custom" || (customStart && customEnd)) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customStart, customEnd]);

  if (!isOwner) {
    return null;
  }

  // Custom Formatter Tooltip sesuai Tab Aktif
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg border border-slate-700 space-y-1">
          <p className="font-bold text-slate-300 mb-1">{label}</p>
          <p style={{ color: item.color }} className="font-semibold">
            {viewType === "omzet"
              ? `Omzet: ${formatRupiah(item.value)}`
              : `Transaksi: ${item.value} Transaksi`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!data.length)
      return (
        <p className="text-center text-slate-500 py-10">
          Tidak ada data untuk ditampilkan.
        </p>
      );

    const isOmzet = viewType === "omzet";
    const chartColor = isOmzet ? "#F59E0B" : "#10B981";

    // Hitung dinamis lebar container jika data sangat banyak (agar di HP bisa di-scroll)
    const minWidth = data.length > 15 ? data.length * 40 : "100%";

    // Tipe Bar Chart untuk Monthly & Yearly
    if (period === "monthly" || period === "yearly") {
      return (
        <div className="w-full overflow-x-auto">
          <div style={{ width: minWidth, minWidth: "100%" }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tickFormatter={formatDateLabel}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval="preserveStartEnd"
                  minTickGap={25}
                />
                <YAxis
                  tickFormatter={isOmzet ? formatRupiahCompact : undefined}
                  allowDecimals={!isOmzet ? false : true}
                  width={isOmzet ? 75 : 40}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={isOmzet ? "total" : "count"}
                  name={isOmzet ? "Omzet" : "Transaksi"}
                  fill={chartColor}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    // Tipe Line Chart untuk Daily & Custom Range
    return (
      <div className="w-full overflow-x-auto">
        <div style={{ width: minWidth, minWidth: "100%" }}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tickFormatter={formatDateLabel}
                tick={{ fontSize: 11, fill: "#64748b" }}
                interval="preserveStartEnd"
                minTickGap={25}
              />
              <YAxis
                tickFormatter={isOmzet ? formatRupiahCompact : undefined}
                allowDecimals={!isOmzet ? false : true}
                width={isOmzet ? 75 : 40}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={isOmzet ? "total" : "count"}
                name={isOmzet ? "Omzet" : "Transaksi"}
                stroke={chartColor}
                strokeWidth={3}
                dot={data.length > 31 ? false : { r: 4, fill: chartColor }} // Sembunyikan titik dot jika data > 31 hari agar tidak berantakan
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
      {/* Top Bar: Header & Periode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Grafik & Analitik Penjualan
        </h2>

        {/* Period Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto">
          {["daily", "monthly", "yearly", "custom"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                period === p
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p === "daily"
                ? "Harian"
                : p === "monthly"
                  ? "Bulanan"
                  : p === "yearly"
                    ? "Tahunan"
                    : "Custom"}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Header: Secondary View Type Tabs (Omzet vs Transaksi) */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewType("omzet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewType === "omzet"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Grafik Omzet (Rp)</span>
          </button>
          <button
            onClick={() => setViewType("transaksi")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewType === "transaksi"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Jumlah Transaksi</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {period === "custom" && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-600">Dari:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-600">Sampai:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="relative min-h-[320px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 backdrop-blur-xs">
            <div className="loader animate-spin rounded-full border-3 border-amber-500 border-t-transparent w-8 h-8" />
          </div>
        )}
        {error && (
          <p className="text-rose-600 text-center py-10 text-xs font-semibold">
            {error}
          </p>
        )}
        {!loading && !error && renderChart()}
      </div>
    </div>
  );
}

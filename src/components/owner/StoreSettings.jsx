import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Store,
  Settings,
  Save,
  RotateCcw,
  Utensils,
  Package,
  Receipt,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";

export default function StoreSettings() {
  const { tenant, settings, refreshContext } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const defaultChannels = [
    { key: "shopeefood", label: "ShopeeFood", is_active: true },
    { key: "gofood", label: "GoFood", is_active: true },
    { key: "grabfood", label: "GrabFood", is_active: true },
    { key: "maxim", label: "Maxim Foods", is_active: false },
  ];

  const [form, setForm] = useState({
    restaurant_name: "",
    branch: "",
    phone: "",
    address: "",
    receipt_footer: "",
    is_dine_in_enabled: true,
    dine_in_fee_type: "percent",
    dine_in_fee_value: 0,
    is_takeaway_enabled: true,
    takeaway_fee_type: "flat",
    takeaway_fee_value: 2000,
    is_online_integration_enabled: false, // Default awal set OFF
    online_channels: defaultChannels,
  });

  const [customChannelName, setCustomChannelName] = useState("");

  useEffect(() => {
    if (tenant && settings) {
      setForm({
        restaurant_name: tenant.name || "",
        branch: tenant.branch || "",
        phone: tenant.phone || "",
        address: tenant.address || "",
        receipt_footer: tenant.receipt_footer || "",
        is_dine_in_enabled: settings.is_dine_in_enabled ?? true,
        dine_in_fee_type: settings.dine_in_fee_type || "percent",
        dine_in_fee_value: settings.dine_in_fee_value ?? 0,
        is_takeaway_enabled: settings.is_takeaway_enabled ?? true,
        takeaway_fee_type: settings.takeaway_fee_type || "flat",
        takeaway_fee_value: settings.takeaway_fee_value ?? 2000,
        // Pastikan membaca boolean asli dari DB, jika null baru fallback ke false
        is_online_integration_enabled:
          settings.is_online_integration_enabled !== undefined &&
          settings.is_online_integration_enabled !== null
            ? Boolean(settings.is_online_integration_enabled)
            : false,
        online_channels:
          settings.online_channels && settings.online_channels.length > 0
            ? settings.online_channels
            : defaultChannels,
      });
    }
  }, [tenant, settings]);

  const handleChannelToggle = (key) => {
    setForm((prev) => ({
      ...prev,
      online_channels: prev.online_channels.map((ch) =>
        ch.key === key ? { ...ch, is_active: !ch.is_active } : ch,
      ),
    }));
  };

  const handleAddCustomChannel = (e) => {
    e.preventDefault();
    if (!customChannelName.trim()) return;

    const newKey = `custom_${Date.now()}`;
    const newChannel = {
      key: newKey,
      label: customChannelName.trim(),
      is_active: true,
    };

    setForm((prev) => ({
      ...prev,
      online_channels: [...prev.online_channels, newChannel],
    }));

    setCustomChannelName("");
  };

  const handleDeleteCustomChannel = (key) => {
    setForm((prev) => ({
      ...prev,
      online_channels: prev.online_channels.filter((ch) => ch.key !== key),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put("/settings", form);
      await refreshContext();
      setMessage({
        type: "success",
        text: "Profil dan pengaturan operasional toko berhasil diperbarui!",
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal memperbarui pengaturan.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetToSeeder = async () => {
    if (
      !window.confirm(
        "PERINGATAN: Aksi ini akan me-reset database ke kondisi Seeder Minimalis. Lanjutkan?",
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/system/reset-seeder");
      await refreshContext();
      setMessage({ type: "success", text: res.data.message });
      window.location.reload();
    } catch (err) {
      setMessage({ type: "error", text: "Gagal me-reset seeder database." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-800"}`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="cursor-pointer text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Profil Restoran & Footer Struk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kelola Profil Restoran & Struk
              </h3>
              <p className="text-xs text-slate-500">
                Nama restoran, alamat, dan pesan penutup pada struk cetak
                pelanggan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Restoran / Toko
              </label>
              <input
                type="text"
                required
                value={form.restaurant_name}
                onChange={(e) =>
                  setForm({ ...form, restaurant_name: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Cabang
              </label>
              <input
                type="text"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Lengkap
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              <span>Footer Struk Pelanggan (Pesan Penutup)</span>
            </label>
            <textarea
              rows={2}
              value={form.receipt_footer}
              onChange={(e) =>
                setForm({ ...form, receipt_footer: e.target.value })
              }
              placeholder="Contoh: Terima kasih atas kunjungan Anda! Selamat menikmati hidangan kami."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* 2. Pengaturan Operasional Layanan POS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pengaturan Operasional Layanan POS
              </h3>
              <p className="text-xs text-slate-500">
                Konfigurasi biaya layanan Dine-In, kemasan Takeaway, dan channel
                Online
              </p>
            </div>
          </div>

          {/* Dine-In Settings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Utensils className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Layanan Makan di Tempat (Dine-In)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Aktifkan opsi dine-in dan atur service fee
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_dine_in_enabled}
                  onChange={(e) =>
                    setForm({ ...form, is_dine_in_enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {form.is_dine_in_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tipe Biaya Layanan
                  </label>
                  <select
                    value={form.dine_in_fee_type}
                    onChange={(e) =>
                      setForm({ ...form, dine_in_fee_type: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="percent">
                      Persentase (%) dari Subtotal
                    </option>
                    <option value="fixed">Nominal Tetap (Rp per Nota)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nilai Biaya Layanan{" "}
                    {form.dine_in_fee_type === "percent" ? "(%)" : "(Rp)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.dine_in_fee_value}
                    onChange={(e) =>
                      setForm({ ...form, dine_in_fee_value: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Takeaway Settings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-orange-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Layanan Bungkus / Bawa Pulang (Takeaway)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Biaya kantong kemasan / box take-out
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_takeaway_enabled}
                  onChange={(e) =>
                    setForm({ ...form, is_takeaway_enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {form.is_takeaway_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Skema Biaya Kemasan
                  </label>
                  <select
                    value={form.takeaway_fee_type}
                    onChange={(e) =>
                      setForm({ ...form, takeaway_fee_type: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                  >
                    <option value="flat">Flat per Nota Transaksi</option>
                    <option value="per_item">Per Porsi / Item Pesanan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nominal Biaya Kemasan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.takeaway_fee_value}
                    onChange={(e) =>
                      setForm({ ...form, takeaway_fee_value: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Integrasi Pesanan Online (OFD) Settings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Integrasi Pesanan Online (OFD)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Aktifkan tombol pencatatan transaksi dari platform mitra
                    delivery
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_online_integration_enabled}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_online_integration_enabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {form.is_online_integration_enabled && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Daftar Channel Platform Aktif di Layar POS
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {form.online_channels.map((ch) => (
                    <div
                      key={ch.key}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200"
                    >
                      <span className="text-xs font-semibold text-slate-800">
                        {ch.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ch.is_active}
                            onChange={() => handleChannelToggle(ch.key)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                        {ch.key.startsWith("custom_") && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomChannel(ch.key)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            title="Hapus Channel Custom"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Tambah Channel Custom */}
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tambah nama platform lain (contoh: Maxim, Yummy)..."
                      value={customChannelName}
                      onChange={(e) => setCustomChannelName(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomChannel}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetToSeeder}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database ke Seeder Murni</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

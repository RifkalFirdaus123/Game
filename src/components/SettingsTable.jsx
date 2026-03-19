import React, { useEffect, useState } from "react";
import { getSettings, updateSettings, resetSettings } from "../utils/settingsDB";

export default function SettingsTable() {
  const [settings, setSettings] = useState({
    title: "",
    subtitle: "",
    link: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Listen for settings updates from other tabs
  useEffect(() => {
    const handleSettingsUpdate = (e) => {
      setSettings({
        title: e.detail.title,
        subtitle: e.detail.subtitle,
        link: e.detail.link
      });
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings({
        title: data.title,
        subtitle: data.subtitle,
        link: data.link
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
      setError("Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!settings.title.trim()) {
      setError("Judul tidak boleh kosong");
      return;
    }
    if (!settings.subtitle.trim()) {
      setError("Subtitle tidak boleh kosong");
      return;
    }
    if (!settings.link.trim()) {
      setError("Link tidak boleh kosong");
      return;
    }

    try {
      setSaving(true);
      await updateSettings({
        title: settings.title.trim(),
        subtitle: settings.subtitle.trim(),
        link: settings.link.trim()
      });
      setSuccess("✓ Pengaturan berhasil disimpan!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setError("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Reset ke pengaturan default?")) {
      try {
        setSaving(true);
        await resetSettings();
        await loadSettings();
        setSuccess("✓ Reset ke default berhasil!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Failed to reset:", error);
        setError("Gagal reset pengaturan");
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-zinc-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="text-2xl sm:text-3xl font-black tracking-tight mb-1">Pengaturan Tampilan Kemenangan</div>
        <div className="text-sm text-zinc-600">Atur pesan yang akan dilihat semua user saat menang</div>
      </div>
      
      {/* Form Section */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/70 p-5 sm:p-6">
        {/* Form Fields */}
        <div className="space-y-5">
          {/* Judul */}
          <div>
            <label className="block text-sm font-bold text-emerald-900 mb-2">
              Judul Pesan
            </label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all bg-white/80"
              placeholder="Contoh: Selamat! Kamu Menang! 🎉"
              aria-label="Judul pesan kemenangan"
            />
            <div className="mt-2 text-xs text-emerald-700">
              Akan ditampilkan besar-besar di layar kemenangan
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-bold text-emerald-900 mb-2">
              Subtitle Pesan
            </label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all bg-white/80"
              placeholder="Contoh: Ini adalah link khusus kamu:"
              aria-label="Subtitle pesan kemenangan"
            />
            <div className="mt-2 text-xs text-emerald-700">
              Teks penjelasan di bawah judul
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-bold text-emerald-900 mb-2">
              URL/Link yang Dibagikan
            </label>
            <input
              type="url"
              value={settings.link}
              onChange={(e) => setSettings({ ...settings, link: e.target.value })}
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all bg-white/80"
              placeholder="https://example.com"
              aria-label="URL link yang dibagikan"
            />
            <div className="mt-2 text-xs text-emerald-700">
              Link yang akan ditampilkan dan bisa dicopy user
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-100/80 border border-red-300 p-3 rounded-lg font-medium">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mt-4 text-sm text-green-700 bg-green-100/80 border border-green-300 p-3 rounded-lg font-medium">
            ✓ {success}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 min-h-[3rem] rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 transition-all font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
          <button
            onClick={handleReset}
            disabled={saving}
            className="min-w-[3rem] min-h-[3rem] rounded-xl bg-white/80 border-2 border-gray-300 hover:bg-gray-50 active:scale-95 transition-all font-bold text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Reset ke pengaturan default"
            aria-label="Reset pengaturan"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/70 p-5 sm:p-6">
        <div className="text-sm font-bold text-blue-900 mb-4">📱 PREVIEW (Seperti yang akan user lihat)</div>
        
        <div className="rounded-xl bg-white/90 border-2 border-emerald-200/50 p-6 space-y-4">
          <div className="animate-bounce">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto flex items-center justify-center text-3xl">
              🎉
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-black text-emerald-700 text-center">
              {settings.title || "Selamat! Kamu Menang! 🎉"}
            </div>
            
            <div className="mt-3 text-sm text-zinc-600 text-center">
              {settings.subtitle || "Ini adalah link khusus kamu:"}
            </div>
          </div>

          <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-lg p-3">
            <code className="text-xs text-emerald-700 font-mono break-all block text-center">
              {settings.link || "https://example.com"}
            </code>
          </div>

          <div className="text-xs text-center text-zinc-600 pt-2">
            Tombol "Salin Link" akan tersedia untuk user
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-amber-50/80 border-2 border-amber-200/70 p-4">
        <div className="text-sm text-amber-900 space-y-2">
          <div className="font-bold">💡 Informasi Penting:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Pengaturan ini akan disimpan dan ditampilkan ke SEMUA user saat mereka menang</li>
            <li>Perubahan akan sinkron otomatis ke semua device/tab dalam hitungan detik</li>
            <li>Gunakan emoji untuk membuat pesan lebih menarik!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

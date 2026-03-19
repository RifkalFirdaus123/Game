import React, { useState, useEffect } from "react";

const ADMIN_USERNAME = "aku";
const ADMIN_PASSWORD = "12345678";

function AdminLoginPanel({ onLoginSuccess, onBackToGame }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      onLoginSuccess();
    } else {
      setError("Username atau password salah.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-2xl sm:text-3xl font-black tracking-tight">Login Admin</div>
      
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        className="w-full min-h-[3rem] rounded-xl bg-white/90 border border-emerald-200/70 px-4 text-lg outline-none focus:ring-2 focus:ring-emerald-500/40"
        aria-label="Username admin"
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        className="w-full min-h-[3rem] rounded-xl bg-white/90 border border-emerald-200/70 px-4 text-lg outline-none focus:ring-2 focus:ring-emerald-500/40"
        aria-label="Password admin"
      />

      {error ? (
        <div className="text-red-600 text-sm font-semibold bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleLogin}
        className="w-full min-h-[3rem] rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-transform font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.35)]"
      >
        Login
      </button>

      <button
        type="button"
        onClick={onBackToGame}
        className="w-full min-h-[3rem] rounded-xl bg-white/80 hover:bg-emerald-50/90 border border-emerald-200/70 font-bold text-lg"
      >
        Kembali
      </button>
    </div>
  );
}

function AdminEmailEditor({ emailTemplate, setEmailTemplate, onBackToGame, onTestEmail }) {
  const [savedPulse, setSavedPulse] = useState(false);
  const [successMessage, setSuccessMessage] = useState(emailTemplate.successMessage || "Selamat! Kamu Menang! 🎉");
  const [successSubtitle, setSuccessSubtitle] = useState(emailTemplate.successSubtitle || "Ini adalah link khusus kamu:");
  const [linkBaseUrl, setLinkBaseUrl] = useState(emailTemplate.linkBaseUrl || "");

  // Sinkronisasi state lokal ketika emailTemplate berubah
  useEffect(() => {
    setSuccessMessage(emailTemplate.successMessage || "Selamat! Kamu Menang! 🎉");
    setSuccessSubtitle(emailTemplate.successSubtitle || "Ini adalah link khusus kamu:");
    setLinkBaseUrl(emailTemplate.linkBaseUrl || "");
  }, [emailTemplate]);

  const handleSaveClick = () => {
    setSavedPulse(true);
    const newTemplate = {
      ...emailTemplate,
      successMessage: successMessage,
      successSubtitle: successSubtitle,
      linkBaseUrl: linkBaseUrl
    };
    setEmailTemplate(newTemplate);
    
    // Emit custom event agar App.jsx tau ada perubahan (untuk tab yang sama)
    window.dispatchEvent(new CustomEvent('gauntletEmailTemplateUpdated', { detail: newTemplate }));
    
    window.setTimeout(() => setSavedPulse(false), 900);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl sm:text-3xl font-black tracking-tight">Edit Pesan dan Email</div>

      {/* Success Message Section */}
      <div className="rounded-2xl bg-blue-50/80 border border-blue-200/70 p-4 sm:p-5">
        <div className="text-lg font-black text-blue-900 mb-3">💬 Pesan Kemenangan</div>
        
        <div className="text-xs text-zinc-600 mb-2">Pesan utama saat menang</div>
        <input
          type="text"
          value={successMessage}
          onChange={(e) => setSuccessMessage(e.target.value)}
          className="w-full min-h-[3rem] rounded-xl bg-white/90 border border-blue-200/70 px-4 text-base outline-none focus:ring-2 focus:ring-blue-500/40"
          placeholder="Selamat! Kamu Menang! 🎉"
          aria-label="Success message"
        />

        <div className="text-xs text-zinc-600 mt-4 mb-2">Subtitle pesan</div>
        <input
          type="text"
          value={successSubtitle}
          onChange={(e) => setSuccessSubtitle(e.target.value)}
          className="w-full min-h-[3rem] rounded-xl bg-white/90 border border-blue-200/70 px-4 text-base outline-none focus:ring-2 focus:ring-blue-500/40"
          placeholder="Ini adalah link khusus kamu:"
          aria-label="Success subtitle"
        />

        <div className="mt-3 p-3 bg-white rounded-lg">
          <div className="text-xs text-zinc-600 mb-2">Preview</div>
          <div className="text-lg font-black text-blue-700">{successMessage || "Selamat! Kamu Menang! 🎉"}</div>
          <div className="text-sm text-zinc-600 mt-2">{successSubtitle || "Ini adalah link khusus kamu:"}</div>
        </div>
      </div>

      {/* Link Configuration Section */}
      <div className="rounded-2xl bg-purple-50/80 border border-purple-200/70 p-4 sm:p-5">
        <div className="text-lg font-black text-purple-900 mb-3">🔗 Konfigurasi Link</div>
        
        <div className="text-xs text-zinc-600 mb-2">Base URL untuk generate link</div>
        <input
          type="url"
          value={linkBaseUrl}
          onChange={(e) => setLinkBaseUrl(e.target.value)}
          className="w-full min-h-[3rem] rounded-xl bg-white/90 border border-purple-200/70 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-500/40"
          placeholder="https://example.com"
          aria-label="Link base URL"
        />

        <div className="mt-3 p-3 bg-white rounded-lg">
          <div className="text-xs text-zinc-600 mb-2">Contoh Link yang di-generate</div>
          <code className="text-xs text-purple-700 font-mono break-all">
            {linkBaseUrl || "(Link akan sesuai dengan apa yang Anda ketik di atas)"}
          </code>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleSaveClick}
          className="flex-1 min-h-[3rem] rounded-xl bg-green-600 hover:bg-green-500 active:scale-95 transition-transform font-bold text-lg shadow-[0_0_30px_rgba(34,197,94,0.25)]"
        >
          {savedPulse ? "✓ Tersimpan!" : "💾 Simpan"}
        </button>
        <button
          type="button"
          onClick={onBackToGame}
          className="min-w-[6rem] min-h-[3rem] rounded-xl bg-white/80 hover:bg-emerald-50/90 active:scale-95 transition-transform border border-emerald-200/70 font-bold text-lg"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState({
    subject: "Tautan Gauntlet Anda - {{name}}",
    body: "Halo {{name}}!\n\nSelamat datang di Gauntlet! Klik tautan berikut untuk mulai bermain:\n\n{{link}}\n\nEmail Anda: {{email}}\n\nGood luck!",
    successMessage: "Selamat! Kamu Menang! 🎉",
    successSubtitle: "Ini adalah link khusus kamu:",
    linkBaseUrl: ""
  });

  useEffect(() => {
    const raw = localStorage.getItem("gauntlet_admin_email_template_v1");
    if (raw) {
      try {
        setEmailTemplate(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to load template:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("gauntlet_admin_email_template_v1", JSON.stringify(emailTemplate));
  }, [emailTemplate]);

  return (
    <div className="min-h-[100dvh] w-full overscroll-y-contain touch-manipulation flex flex-col">
      <div className="flex-1 max-w-md mx-auto px-4 py-4 sm:py-6 w-full flex flex-col justify-center">
        <div className="gauntlet-enter rounded-2xl border border-emerald-500/20 bg-white/85 backdrop-blur shadow-[0_0_0_1px_rgba(16,185,129,0.18)]">
          <div className="p-4 sm:p-5 border-b border-emerald-900/10">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-emerald-600 shadow-[0_0_18px_rgba(16,185,129,0.35)]" />
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tight">Admin Panel</div>
                <div className="mt-1 text-sm sm:text-base text-zinc-700">
                  {isLoggedIn ? "Template Email" : "Login untuk akses"}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            {!isLoggedIn ? (
              <AdminLoginPanel 
                onLoginSuccess={() => setIsLoggedIn(true)}
                onBackToGame={() => window.history.back()}
              />
            ) : (
              <AdminEmailEditor 
                emailTemplate={emailTemplate}
                setEmailTemplate={setEmailTemplate}
                onBackToGame={() => setIsLoggedIn(false)}
                onTestEmail={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

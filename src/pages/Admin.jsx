import React, { useState, useEffect } from "react";
import SettingsTable from "../components/SettingsTable";

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

function AdminEmailEditor({ onBackToGame }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Settings Table */}
      <SettingsTable />

      {/* Exit Button */}
      <button
        type="button"
        onClick={onBackToGame}
        className="min-w-[6rem] min-h-[3rem] rounded-xl bg-white/80 hover:bg-emerald-50/90 active:scale-95 transition-transform border border-emerald-200/70 font-bold text-lg"
      >
        Keluar
      </button>
    </div>
  );
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
                  {isLoggedIn ? "Pengaturan Tampilan Kemenangan" : "Login untuk akses"}
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
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

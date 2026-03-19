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
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testLoading, setTestLoading] = useState(false);

  const sampleName = "Rifka";
  const sampleEmail = "contoh@domain.com";
  const sampleLink = "https://example.com/gauntlet?demo=1";

  const subjectPreview =
    (emailTemplate.subject ?? "")
      .replaceAll("{{name}}", sampleName)
      .replaceAll("{{email}}", sampleEmail)
      .replaceAll("{{link}}", sampleLink) || "—";
  const bodyPreview =
    (emailTemplate.body ?? "")
      .replaceAll("{{name}}", sampleName)
      .replaceAll("{{email}}", sampleEmail)
      .replaceAll("{{link}}", sampleLink) || "—";

  const handleSaveClick = () => {
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 900);
  };

  const handleTestEmail = async () => {
    setTestLoading(true);
    setTestEmailSent(false);
    
    try {
      const subject = (emailTemplate.subject ?? "Test Subject")
        .replaceAll("{{name}}", "Test User")
        .replaceAll("{{email}}", testEmail)
        .replaceAll("{{link}}", "https://example.com");
      
      const body = (emailTemplate.body ?? "Test body")
        .replaceAll("{{name}}", "Test User")
        .replaceAll("{{email}}", testEmail)
        .replaceAll("{{link}}", "https://example.com");
      
      const apiKey = import.meta.env.VITE_RESEND_API_KEY;
      if (!apiKey) {
        throw new Error("API key tidak tersedia. Hubungi admin.");
      }

      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Gauntlet Game <onboarding@resend.dev>",
          to: testEmail,
          subject: subject,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>${subject}</h2><p>${body.replace(/\n/g, "<br>")}</p></div>`
        })
      });

      if (resp.ok) {
        setTestEmailSent(true);
        setTimeout(() => setTestEmailSent(false), 3000);
      } else {
        const data = await resp.json();
        throw new Error(data?.message || "Gagal mengirim test email");
      }
    } catch (err) {
      console.error("Test email error:", err);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl sm:text-3xl font-black tracking-tight">Editor Template Email</div>
      <div className="text-zinc-700 text-sm sm:text-base">
        Gunakan token: <span className="font-black text-zinc-900">{"{{name}}"}</span>,{" "}
        <span className="font-black text-zinc-900">{"{{email}}"}</span>, dan{" "}
        <span className="font-black text-zinc-900">{"{{link}}"}</span>.
      </div>

      <div className="rounded-2xl bg-white/80 border border-emerald-200/70 p-4 sm:p-5">
        <div className="text-xs text-zinc-600 mb-2">Subject</div>
        <input
          type="text"
          value={emailTemplate.subject}
          onChange={(e) => setEmailTemplate((t) => ({ ...t, subject: e.target.value }))}
          className="w-full min-h-[3rem] rounded-xl bg-white/90 border border-emerald-200/70 px-4 text-lg outline-none focus:ring-2 focus:ring-emerald-500/40"
          aria-label="Subject email"
        />

        <div className="text-xs text-zinc-600 mt-4 mb-2">Body</div>
        <textarea
          value={emailTemplate.body}
          onChange={(e) => setEmailTemplate((t) => ({ ...t, body: e.target.value }))}
          rows={7}
          className="w-full rounded-xl bg-white/90 border border-emerald-200/70 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
          aria-label="Body email"
        />

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleSaveClick}
            className="flex-1 min-h-[3rem] rounded-xl bg-green-600 hover:bg-green-500 active:scale-95 transition-transform font-bold text-lg shadow-[0_0_30px_rgba(34,197,94,0.25)]"
          >
            {savedPulse ? "✓ Tersimpan!" : "Simpan"}
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

      {/* Test Email Section */}
      <div className="rounded-2xl bg-blue-50/80 border border-blue-200/70 p-4 sm:p-5">
        <div className="text-lg sm:text-xl font-bold text-blue-900 mb-3">🧪 Test Email</div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTestEmail()}
              placeholder="test@example.com"
              className="flex-1 min-h-[2.5rem] rounded-lg bg-white border border-blue-200/70 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400/40"
            />
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testLoading}
              className="px-6 min-h-[2.5rem] rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-95"
            >
              {testLoading ? "⏳..." : "Kirim"}
            </button>
          </div>
          {testEmailSent && (
            <div className="text-green-700 bg-green-100 border border-green-300 p-2.5 rounded-lg text-sm font-medium">
              ✓ Test email berhasil dikirim ke <strong>{testEmail}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 border border-emerald-200/70 p-4 sm:p-5">
        <div className="text-xs text-zinc-600 mb-2">Preview (contoh)</div>
        <div className="text-sm text-zinc-900 font-semibold mb-2">{subjectPreview}</div>
        <pre className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{bodyPreview}</pre>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState({
    subject: "Tautan Gauntlet Anda - {{name}}",
    body: "Halo {{name}}!\n\nSelamat datang di Gauntlet! Klik tautan berikut untuk mulai bermain:\n\n{{link}}\n\nEmail Anda: {{email}}\n\nGood luck!"
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

// Vercel Serverless Function: mengirim email via Resend.
// Environment variables yang dibutuhkan:
// - RESEND_API_KEY
// - RESEND_FROM_EMAIL (mis: "noreply@domain.com")
//
// Payload yang diharapkan:
// { to: string, subject: string, body: string }

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendViaResend({ to, subject, body }) {
  const html = `<div>${escapeHtml(body).replaceAll("\n", "<br/>")}</div>`;
  const text = String(body);

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html
    })
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    const message = data?.error?.message || "Resend error";
    throw new Error(message);
  }

  return data;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { to, subject, body } = req.body || {};
    if (!to || !subject || !body) {
      res.status(400).json({ error: "Missing fields: to, subject, body" });
      return;
    }

    // Development mode: jika RESEND_API_KEY tidak ada, mock success
    if (!RESEND_API_KEY || !FROM_EMAIL) {
      console.log("📧 [DEV MODE] Email mock dikirim ke:", to);
      console.log("Subject:", subject);
      console.log("Body:", body);
      res.status(200).json({ 
        ok: true, 
        id: "mock-" + Date.now(),
        message: "Email berhasil dikirim (mode development)"
      });
      return;
    }

    // Production mode: kirim via Resend
    const result = await sendViaResend({ to, subject, body });
    res.status(200).json({ ok: true, id: result?.id ?? null });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
};


import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, template } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const subject = (template?.subject || "Tautan Gauntlet Anda")
      .replace("{{name}}", "Test User")
      .replace("{{email}}", email)
      .replace("{{link}}", "https://example.com/gauntlet");

    const body = (template?.body || "Ini adalah test email")
      .replace("{{name}}", "Test User")
      .replace("{{email}}", email)
      .replace("{{link}}", "https://example.com/gauntlet");

    const response = await resend.emails.send({
      from: "Gauntlet Game <onboarding@resend.dev>",
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <p>${body.replace(/\n/g, "<br>")}</p>
        </div>
      `
    });

    if (response.error) {
      return res.status(400).json({ error: response.error.message });
    }

    return res.status(200).json({ success: true, id: response.data.id });
  } catch (error) {
    console.error("Test email error:", error);
    return res.status(500).json({ error: error.message });
  }
}

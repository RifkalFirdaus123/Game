import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, template } = req.body;

    const emailTemplate = template || {
      subject: "Tautan Gauntlet Anda",
      body: "Halo Rifkal!\n\nSelamat! Anda berhasil menyelesaikan 5 tahap gauntlet.\n\nKlik tautan di bawah untuk mendapatkan hadiah:\nhttps://example.com/gauntlet\n\nTerima kasih!"
    };

    // Replace tokens with sample data
    const subject = emailTemplate.subject
      .replace("{{name}}", "Rifkal")
      .replace("{{email}}", email);

    const body = emailTemplate.body
      .replace("{{name}}", "Rifkal")
      .replace("{{email}}", email)
      .replace("{{link}}", "https://example.com/gauntlet");

    // Send test email via Resend
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
      return res.status(400).json({ error: response.error });
    }

    return res.status(200).json({ success: true, id: response.data.id });
  } catch (error) {
    console.error("Test email error:", error);
    return res.status(500).json({ error: error.message });
  }
}

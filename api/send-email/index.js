module.exports = async function handler(req, res) {
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
    const { name, email, template } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email required" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured");
      return res.status(500).json({ error: "API key not configured" });
    }

    const subject = (template?.subject || "Tautan Gauntlet Anda")
      .replace("{{name}}", name)
      .replace("{{email}}", email)
      .replace("{{link}}", "https://example.com/gauntlet");

    const body = (template?.body || "Selamat bermain!")
      .replace("{{name}}", name)
      .replace("{{email}}", email)
      .replace("{{link}}", "https://example.com/gauntlet");

    // Send via Resend API using fetch
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Gauntlet Game <onboarding@resend.dev>",
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${subject}</h2>
            <p>${body.replace(/\n/g, "<br>")}</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", {
        status: response.status,
        data: data
      });
      return res.status(response.status).json({ error: data.message || "Failed to send email" });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: error.message });
  }
};

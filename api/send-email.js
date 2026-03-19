const handler = async (req, res) => {
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, subject, html } = req.body;

    if (!email || !subject || !html) {
      console.error('Missing fields:', { email: !!email, subject: !!subject, html: !!html });
      return res.status(400).json({ error: 'Missing required fields: email, subject, and html are all required' });
    }

    // Validasi API key Brevo
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Kirim email via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: [{ email: email }],
        sender: { 
          name: 'Gauntlet Game',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@gauntletgame.com'
        },
        subject: subject,
        htmlContent: html
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API error:', {
        status: response.status,
        data: data
      });
      return res.status(response.status).json({ error: data.message || 'Failed to send email' });
    }

    console.log('Email sent successfully via Brevo:', data.messageId);
    return res.status(200).json({ success: true, id: data.messageId });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = handler;

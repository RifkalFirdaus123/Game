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

    // Validasi API key Mailgun
    const mailgunApiKey = process.env.MAILGUN_API_KEY;
    const mailgunDomain = process.env.MAILGUN_DOMAIN;
    
    if (!mailgunApiKey || !mailgunDomain) {
      console.error('Mailgun credentials not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Buat form data untuk Mailgun
    const formData = new URLSearchParams();
    formData.append('from', `Gauntlet Game <noreply@${mailgunDomain}>`);
    formData.append('to', email);
    formData.append('subject', subject);
    formData.append('html', html);

    // Kirim email via Mailgun API
    const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mailgun API error:', {
        status: response.status,
        data: data
      });
      return res.status(response.status).json({ error: data.message || 'Failed to send email' });
    }

    console.log('Email sent successfully via Mailgun:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = handler;

const handler = async (req, res) => {
  // Set JSON response header dari awal
  res.setHeader("Content-Type", "application/json");
  
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
      console.error('Missing fields:', { 
        hasEmail: !!email, 
        hasSubject: !!subject, 
        hasHtml: !!html,
        body: req.body 
      });
      return res.status(400).json({ error: 'Missing required fields: email, subject, and html are all required' });
    }

    // Validasi API key Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ error: 'Email service not configured - please set RESEND_API_KEY' });
    }

    console.log('Sending email to:', email);

    // Kirim email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Gauntlet <delivery@resend.dev>',
        to: email,
        subject: subject,
        html: html
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', {
        status: response.status,
        message: data.message,
        fullData: data
      });
      return res.status(response.status).json({ 
        error: data.message || 'Failed to send email',
        details: data
      });
    }

    console.log('Email sent successfully via Resend:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      type: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = handler;

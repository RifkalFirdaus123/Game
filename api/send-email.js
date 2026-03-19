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

    console.log('Sending email to:', email);

    // Gunakan SendGrid API (gratis dan reliable)
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    
    if (!sendgridApiKey) {
      console.error('SENDGRID_API_KEY not configured - using mock response');
      // Untuk development tanpa API key
      return res.status(200).json({ 
        success: true, 
        id: 'mock-' + Math.random().toString(36).substr(2, 9),
        message: 'Email would be sent in production (no API key configured)'
      });
    }

    // Kirim email via SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email }],
          subject: subject
        }],
        from: {
          email: 'noreply@gauntletgame.com',
          name: 'Gauntlet Game'
        },
        content: [{
          type: 'text/html',
          value: html
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('SendGrid API error:', {
        status: response.status,
        error: errorData
      });
      return res.status(response.status).json({ 
        error: 'Failed to send email',
        details: errorData
      });
    }

    const messageId = response.headers.get('X-Message-Id') || 'sent-' + Date.now();
    console.log('Email sent successfully via SendGrid:', messageId);
    return res.status(200).json({ success: true, id: messageId });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      type: error.name
    });
  }
};

module.exports = handler;

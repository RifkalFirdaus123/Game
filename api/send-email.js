const nodemailer = require('nodemailer');

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
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validasi config SMTP
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP_USER / SMTP_PASS not configured');
      return res.status(500).json({ error: 'SMTP is not configured on server' });
    }

    // Konfigurasi SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Kirim email
    const info = await transporter.sendMail({
      from: `Gauntlet Game <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return res.status(200).json({ success: true, id: info.messageId });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = handler;

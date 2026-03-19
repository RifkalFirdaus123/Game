module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    apiKey: process.env.RESEND_API_KEY ? "✅ Set" : "❌ Not set"
  });
};

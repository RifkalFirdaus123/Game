// Simple Express server untuk development
// Handles API routes dan proxy ke Vite dev server
const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');
const sendEmailHandler = require('./api/send-email.cjs');

const app = express();
const proxy = httpProxy.createProxyServer({});

// Middleware
app.use(express.json());

// API Routes
app.post('/api/send-email', async (req, res) => {
  try {
    await sendEmailHandler(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test email endpoint - untuk cek apakah email bisa terkirim
app.post('/api/test-email', async (req, res) => {
  const { to = 'test@example.com', subject = 'Test Email', body = 'Test body' } = req.body || {};
  
  console.log('\n📧 [TEST EMAIL]');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Body:', body);
  console.log('');
  
  try {
    const testReq = {
      method: 'POST',
      body: { to, subject, body }
    };
    
    let responded = false;
    const testRes = {
      statusCode: 200,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        responded = true;
        res.status(this.statusCode).json(data);
      },
      end: function(data) {
        if (!responded) {
          res.status(this.statusCode).send(data);
        }
      }
    };
    
    await sendEmailHandler(testReq, testRes);
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Proxy ke Vite dev server
proxy.on('error', (err, req, res) => {
  res.status(500).json({ error: 'Proxy error' });
});

app.use((req, res) => {
  proxy.web(req, res, {
    target: 'http://127.0.0.1:5173',
    changeOrigin: true,
    ws: true
  });
});

const PORT = 3000;
const server = http.createServer(app);

// Upgrade untuk WebSocket (HMR dari Vite)
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, {
    target: 'http://127.0.0.1:5173',
    changeOrigin: true
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n✅ Dev Server jalan di http://localhost:${PORT}`);
  console.log(`📧 Email API: POST http://localhost:${PORT}/api/send-email`);
  console.log(`🧪 Test Email: POST http://localhost:${PORT}/api/test-email`);
  console.log(`\n📝 API diproxy ke Vite dev server di port 5173\n`);
});

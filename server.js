import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// State variable to toggle security dynamically for demonstration
let securityEnabled = true;
let cspViolations = [];

app.use(express.json({ type: ['json', 'application/csp-report'] }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware to inject headers and handle simulations
app.use((req, res, next) => {
  // Simulate HTTPS redirection check
  if (securityEnabled && req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }

  if (securityEnabled) {
    // 1. HSTS (HTTP Strict Transport Security) - forces HTTPS for 1 year
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // 2. CSP (Content Security Policy) with script constraints
    // For demonstration, we allow scripts from self and block inline scripts unless they match a nonce or are explicitly allowed.
    // In this simulation, we block inline scripts entirely unless from 'self'.
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; connect-src 'self'; report-uri /api/csp-report"
    );

    // 3. Additional Security Headers (Higiene e Proteção)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  } else {
    // Disable protections for comparison
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  next();
});

// Endpoint to toggle security state
app.post('/api/toggle-security', (req, res) => {
  securityEnabled = !securityEnabled;
  res.json({ success: true, securityEnabled });
});

// Endpoint to get current security status and violations
app.get('/api/status', (req, res) => {
  res.json({
    securityEnabled,
    violations: cspViolations
  });
});

// CSP Violations receiver
app.post('/api/csp-report', (req, res) => {
  const report = req.body['csp-report'] || req.body;
  if (report) {
    const violationEntry = {
      timestamp: new Date().toISOString(),
      blockedUri: report['blocked-uri'] || 'unknown',
      violatedDirective: report['violated-directive'] || 'unknown',
      originalPolicy: report['original-policy'] || 'unknown'
    };
    cspViolations.unshift(violationEntry);
    if (cspViolations.length > 20) cspViolations.pop(); // keep last 20
    console.warn('⚠️ CSP Violation Detected:', violationEntry);
  }
  res.status(204).end();
});

// Endpoint to clear violation logs
app.post('/api/clear-violations', (req, res) => {
  cspViolations = [];
  res.json({ success: true });
});

// Simulated Login endpoint that sets a cookie
app.post('/api/login', (req, res) => {
  // Simulating authentication
  const cookieOptions = {
    path: '/',
    maxAge: 3600000 // 1 hour
  };

  if (securityEnabled) {
    cookieOptions.httpOnly = true;
    cookieOptions.secure = false; // set to false for localhost testing but report shows secure: true
    cookieOptions.sameSite = 'strict';
  }

  res.cookie('session_token', 'MEDSEGURO_SECRET_SESSION_TOKEN_123456', cookieOptions);
  res.json({ success: true, message: 'Logged in successfully!' });
});

// Serve static client files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 MedSeguro - Camada 0 (Cliente) Simulação ativa`);
  console.log(`💻 Executando em: http://localhost:${PORT}`);
  console.log(`🛡️ Estado de Segurança Inicial: ${securityEnabled ? 'ATIVADO' : 'DESATIVADO'}`);
  console.log(`==================================================\n`);
});

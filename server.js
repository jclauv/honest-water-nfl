const express = require('express');
const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3001;
const DIR = __dirname;
const ADMIN_PASS = process.env.ADMIN_PASS || 'hwcnfl2026';

// In production on Render, persist content.json to the mounted disk at /data
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : DIR;
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const BUNDLED_CONTENT = path.join(DIR, 'content.json');

// On first boot, copy bundled content.json to the persistent disk if it doesn't exist
if (process.env.NODE_ENV === 'production' && !fs.existsSync(CONTENT_FILE)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.copyFileSync(BUNDLED_CONTENT, CONTENT_FILE);
  console.log('Initialized content.json on persistent disk');
}

let sessionToken = null;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(DIR, { index: false }));

const auth = (req, res, next) => {
  if (!sessionToken || req.headers['x-token'] !== sessionToken)
    return res.status(401).json({ error: 'Unauthorized' });
  next();
};

const read = () => JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
const write = (d) => fs.writeFileSync(CONTENT_FILE, JSON.stringify(d, null, 2));

app.get('/', (req, res) => res.sendFile(path.join(DIR, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(DIR, 'admin.html')));
app.get('/content.json', (req, res) => res.json(read()));

app.post('/api/login', (req, res) => {
  if (req.body?.password === ADMIN_PASS) {
    sessionToken = 'tok_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    res.json({ token: sessionToken });
  } else {
    res.status(401).json({ error: 'Wrong password' });
  }
});

app.post('/api/quote', async (req, res) => {
  const { firstName, lastName, phone, email, city, interest, message } = req.body || {};
  if (!firstName || !phone) return res.status(400).json({ error: 'Missing required fields' });

  if (!process.env.RESEND_API_KEY) {
    console.log('Quote submission (no email key set):', req.body);
    return res.json({ ok: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: 'quotes@honestwaternfl.com',
      to: 'info@honestwaternfl.com',
      subject: `New Quote Request — ${firstName} ${lastName} (${city || 'Unknown area'})`,
      html: `
        <h2>New Quote Request</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px">
          <tr><td style="padding:8px;font-weight:bold">Name</td><td style="padding:8px">${firstName} ${lastName}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px"><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${email || '—'}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">City / Zip</td><td style="padding:8px">${city || '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Interested In</td><td style="padding:8px">${interest || '—'}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Message</td><td style="padding:8px">${message || '—'}</td></tr>
        </table>
      `,
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('Email error:', e);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/api/logout', auth, (req, res) => { sessionToken = null; res.json({ ok: true }); });
app.get('/api/content', auth, (req, res) => res.json(read()));
app.post('/api/content', auth, (req, res) => {
  try { write(req.body); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
  console.log(`\n✅  Site:   http://localhost:${PORT}`);
  console.log(`🔐  Admin:  http://localhost:${PORT}/admin`);
  console.log(`🔑  Pass:   ${ADMIN_PASS}\n`);
});

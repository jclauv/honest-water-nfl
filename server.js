const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DIR = __dirname;
const CONTENT_FILE = path.join(DIR, 'content.json');
const ADMIN_PASS = process.env.ADMIN_PASS || 'hwcnfl2026'; // set ADMIN_PASS env var on your host

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

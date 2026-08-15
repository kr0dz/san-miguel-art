import crypto from 'node:crypto';

const COOKIE = 'smart_admin';
const MAX_AGE = 8 * 60 * 60;

function config() {
  const password = process.env.SMART_ADMIN_PASSWORD || '';
  const token = process.env.GITHUB_CONTENT_TOKEN || '';
  return { password, token, ready: Boolean(password && token) };
}

function hmacKey() {
  const { password, token } = config();
  return `${password}:${token}`;
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function sign(exp) {
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', hmacKey()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verify(value) {
  try {
    const [payload, signature] = String(value || '').split('.');
    if (!payload || !signature) return false;
    const expected = crypto.createHmac('sha256', hmacKey()).update(payload).digest('base64url');
    if (!safeEqual(signature, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

function cookie(req) {
  const raw = req.headers.cookie || '';
  const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export default async function handler(req, res) {
  const cfg = config();
  res.setHeader('Cache-Control', 'no-store');

  if (!cfg.ready) {
    return res.status(503).json({ ok: false, setupRequired: true, message: 'Faltan variables privadas de administración en Vercel.' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ authenticated: verify(cookie(req)) });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ ok: false });
  }

  const supplied = req.body?.password || '';
  if (!safeEqual(supplied, cfg.password)) {
    return res.status(401).json({ ok: false, message: 'Contraseña incorrecta.' });
  }

  const session = sign(Date.now() + MAX_AGE * 1000);
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(session)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`);
  return res.status(200).json({ ok: true });
}

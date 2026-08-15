import crypto from 'node:crypto';

const OWNER = 'kr0dz';
const REPO = 'san-miguel-art';
const BRANCH = 'main';
const COOKIE = 'smart_admin';

function cfg() {
  return {
    password: process.env.SMART_ADMIN_PASSWORD || '',
    token: process.env.GITHUB_CONTENT_TOKEN || ''
  };
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function sessionValid(req) {
  const { password, token } = cfg();
  if (!password || !token) return false;
  const raw = req.headers.cookie || '';
  const match = raw.match(/(?:^|;\s*)smart_admin=([^;]+)/);
  if (!match) return false;
  try {
    const value = decodeURIComponent(match[1]);
    const [payload, signature] = value.split('.');
    const key = `${password}:${token}`;
    const expected = crypto.createHmac('sha256', key).update(payload).digest('base64url');
    if (!safeEqual(signature, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

function ghHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };
}

function slug(value) {
  return String(value || 'imagen')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'imagen';
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const { password, token } = cfg();
  if (!password || !token) return res.status(503).json({ ok: false, setupRequired: true });
  if (!sessionValid(req)) return res.status(401).json({ ok: false, message: 'Sesión no válida.' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  try {
    const { name, data } = req.body || {};
    const match = String(data || '').match(/^data:image\/(webp|jpeg|jpg|png);base64,(.+)$/i);
    if (!match) return res.status(400).json({ ok: false, message: 'Imagen inválida.' });
    const base64 = match[2];
    const bytes = Math.floor(base64.length * 0.75);
    if (bytes > 3.5 * 1024 * 1024) return res.status(413).json({ ok: false, message: 'La imagen optimizada supera 3.5 MB.' });

    const extension = match[1].toLowerCase() === 'jpeg' || match[1].toLowerCase() === 'jpg' ? 'jpg' : match[1].toLowerCase();
    const file = `${Date.now()}-${slug(name)}.${extension}`;
    const path = `assets/uploads/${file}`;
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
    const r = await fetch(url, {
      method: 'PUT',
      headers: ghHeaders(token),
      body: JSON.stringify({
        message: `Upload CMS image: ${file}`,
        content: base64,
        branch: BRANCH
      })
    });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`GitHub upload ${r.status}: ${text.slice(0, 180)}`);
    }

    const raw = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
    return res.status(200).json({ ok: true, url: raw, path });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || 'No se pudo subir la imagen.' });
  }
}

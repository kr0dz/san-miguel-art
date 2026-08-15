import crypto from 'node:crypto';

const OWNER = 'kr0dz';
const REPO = 'san-miguel-art';
const BRANCH = 'main';
const PATH = 'data/site-content.json';
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

async function readFile(token) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`;
  const r = await fetch(url, { headers: ghHeaders(token), cache: 'no-store' });
  if (!r.ok) throw new Error(`GitHub GET ${r.status}`);
  const file = await r.json();
  const json = JSON.parse(Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8'));
  return { json, sha: file.sha };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const { password, token } = cfg();
  if (!password || !token) return res.status(503).json({ ok: false, setupRequired: true });
  if (!sessionValid(req)) return res.status(401).json({ ok: false, message: 'Sesión no válida.' });

  try {
    if (req.method === 'GET') {
      const { json } = await readFile(token);
      return res.status(200).json({ ok: true, content: json });
    }

    if (req.method !== 'PUT') {
      res.setHeader('Allow', 'GET, PUT');
      return res.status(405).json({ ok: false });
    }

    const content = req.body?.content;
    if (!content || typeof content !== 'object') return res.status(400).json({ ok: false, message: 'Contenido inválido.' });

    const { sha } = await readFile(token);
    const encoded = Buffer.from(JSON.stringify(content, null, 2) + '\n', 'utf8').toString('base64');
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
    const r = await fetch(url, {
      method: 'PUT',
      headers: ghHeaders(token),
      body: JSON.stringify({
        message: 'Update site content from SMArt CMS',
        content: encoded,
        sha,
        branch: BRANCH
      })
    });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`GitHub PUT ${r.status}: ${text.slice(0, 180)}`);
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || 'Error del CMS.' });
  }
}

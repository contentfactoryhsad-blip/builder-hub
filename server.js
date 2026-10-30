/**
 * Builder Hub 서버 — public 폴더를 그대로 서빙한다 (빌드 단계 없음).
 *
 *   npm start   →  http://localhost:3020
 */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3020;

/*
  통합 통계 — 빌더마다 따로 있던 #stats 화면을 허브 한곳에서 본다 (public/stats.html).
  기록은 지금처럼 각 빌더 서버에 쌓이고, 허브 서버가 그 빌더의 열쇠로 대신 받아 온다.
  사용자는 허브 열쇠(HUB_STATS_KEY) 하나만 알면 된다. 빌더 열쇠는 Railway 변수에만 둔다.
*/
const BUILDERS = {
  sales: { url: 'https://sales-banner-builder.lge-d2c.com', key: () => process.env.SALES_USAGE_KEY },
  bf: { url: 'https://lg-bf-builder.lge-d2c.com', key: () => process.env.BF_USAGE_KEY },
  christmas: { url: 'https://christmas-builder.lge-d2c.com', key: () => process.env.CHRISTMAS_USAGE_KEY },
};
const clean = v => String(v ?? '').trim().replace(/^["']|["']$/g, '');
function guard(req, res) {
  const key = clean(process.env.HUB_STATS_KEY);
  if (!key) { res.status(503).json({ error: 'HUB_STATS_KEY not set on server' }); return null; }
  if (clean(req.query.key) !== key) { res.status(403).json({ error: 'Forbidden' }); return null; }
  const b = BUILDERS[req.params.builder];
  if (req.params.builder && !b) { res.status(404).json({ error: 'Unknown builder' }); return null; }
  if (b && !clean(b.key())) { res.status(503).json({ error: `${req.params.builder} key not set on hub` }); return null; }
  return b || true;
}
/** 빌더 서버로 넘긴다 — 잠자던 서버(Railway sleep)가 깨는 동안 기다리도록 넉넉히 */
async function relay(b, pathAndQuery, res, { binary = false } = {}) {
  try {
    const sep = pathAndQuery.includes('?') ? '&' : '?';
    const r = await fetch(`${b.url}${pathAndQuery}${sep}key=${encodeURIComponent(clean(b.key()))}`, { signal: AbortSignal.timeout(60000) });
    res.status(r.status);
    for (const h of ['content-type', 'content-disposition', 'cache-control']) { const v = r.headers.get(h); if (v) res.setHeader(h, v); }
    if (binary) return res.send(Buffer.from(await r.arrayBuffer()));
    return res.send(await r.text());
  } catch (err) {
    return res.status(502).json({ error: `Builder did not answer: ${err.message}` });
  }
}

/* 열쇠 확인 — 첫 화면 */
app.get('/api/stats/check', (req, res) => { if (guard(req, res)) res.json({ ok: true, builders: Object.keys(BUILDERS) }); });
app.get('/api/stats/:builder/usage.json', (req, res) => { const b = guard(req, res); if (b) relay(b, '/api/usage.json', res); });
app.get('/api/stats/:builder/usage.csv', (req, res) => {
  const b = guard(req, res);
  if (b) relay(b, `/api/usage.csv?tz=${encodeURIComponent(req.query.tz || 'Asia/Seoul')}`, res, { binary: true });
});
app.get('/api/stats/:builder/output', (req, res) => { const b = guard(req, res); if (b) relay(b, `/api/output?id=${encodeURIComponent(req.query.id || '')}`, res); });
app.get('/api/stats/:builder/output/file', (req, res) => {
  const b = guard(req, res);
  if (b) relay(b, `/api/output/file?id=${encodeURIComponent(req.query.id || '')}&name=${encodeURIComponent(req.query.name || '')}`, res, { binary: true });
});

// 통합 통계 화면 — /stats (화면 어디에도 링크가 없다)
app.get('/stats', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'stats.html')));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

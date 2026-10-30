/**
 * 통합 통계 — Sales Banner · Black Friday · Christmas 빌더의 #stats 화면을 한곳에서.
 * 열쇠(HUB_STATS_KEY)를 한 번 넣으면 빌더를 골라 들어간다. 데이터는 허브 서버가 각 빌더에서 대신 받아 온다 (server.js).
 * 빌더마다 CSV 칸이 달라서(Sales 는 design·promotion…, BF·Christmas 는 item·detail) 아래 BUILDERS 에 화면 구성을 따로 둔다.
 */
const KEY_STORE = 'hub-stats-key';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

/* 블프 빌더가 이름을 바꾸기 전에 쌓인 에셋 id — 표시할 때만 새 이름으로 (블프 UsageStats 와 같다) */
const BF_RENAME = {
  'ad-teasing': 'dynamic', 'kv-main-motion': 'dynamic', 'kv-product-centric-1': 'hero-product',
  'kv-product-centric-2': 'hero-product-non-ac', 'kv-product-slot': 'product-slot', 'kv-product-slot-character': 'product-slot-joy-ryder',
};
const bfName = id => BF_RENAME[id] ?? id;

/**
 * 빌더별 화면 구성.
 *   files: 만들어진 파일 수 칸 · tabs: builder 칸으로 나누는 탭 (블프는 두 빌더가 한 CSV)
 *   bars(tab): [제목, 칸, 쪼갤 구분자?, 이름 바꾸기?] · cols(tab): [머리, r => 값]
 */
const BUILDERS = {
  sales: {
    name: 'Sales Banner Builder', thumb: 'thumbs/sales.png', files: 'banners', filesLabel: '만들어진 배너',
    bars: () => [['국가별', 'country'], ['시안 (A/B)', 'design'], ['프로모션', 'promotion'], ['매체', 'channels', '|'], ['제품 (모델)', 'product_models', '|']],
    cols: () => [['시안', r => r.design], ['프로모션', r => r.promotion], ['제품', r => `${r.products ?? ''}${r.product_models ? ` · ${r.product_models}` : ''}`],
      ['박스', r => r.boxes], ['매체', r => r.channels], ['장수', r => r.banners]],
    tail: [['의견', r => r.comment]],
  },
  bf: {
    name: 'Black Friday Builder', thumb: 'thumbs/black-friday.png', files: 'files', filesLabel: '만들어진 파일',
    tabs: [['content-banner', 'Content Banner Builder'], ['promotion-page', 'Promotion Page Builder']],
    bars: tab => (tab === 'promotion-page'
      ? [['국가별', 'country'], ['구성 (스태틱 / 스태틱+모션)', 'detail'], ['Hero KV', 'item', '|', 'hero'], ['Benefit Summary', 'item', '|', 'card'],
        ['Promotion Banner', 'item', '|', 'promo'], ['Deal Banner', 'item', '|', 'deal']]
      : [['국가별', 'country'], ['에셋 (키비주얼)', 'item', '|', null, bfName], ['채널 / 구성', 'detail']]),
    cols: tab => [...(tab === 'promotion-page' ? [] : [['에셋', r => r.item]]), ['채널/구성', r => r.detail], ['파일 수', r => r.files]],
  },
  christmas: {
    name: 'Christmas Builder', thumb: 'thumbs/christmas.png', files: 'files', filesLabel: '만들어진 파일',
    bars: () => [['국가별', 'country'], ['비주얼 (타입 · 톤)', 'item'], ['받은 것 (채널 / 원본)', 'detail', null, null, d => (d === 'visual' ? 'Visual PNG (3000²)' : d)], ['지역', 'region']],
    cols: () => [['비주얼', r => r.item], ['받은 것', r => (r.detail === 'visual' ? 'Visual PNG (3000²)' : r.detail)], ['파일 수', r => r.files]],
  },
};

let key = localStorage.getItem(KEY_STORE) || '';
let view = { builder: null, tab: null, period: { kind: 'all' } };
const cache = {}; // builder → rows

/* 서버는 UTC(ISO) — 화면에서는 보는 사람의 현지 시각으로 */
const p2 = n => String(n).padStart(2, '0');
const local = r => { const d = new Date(r.time ?? ''); return Number.isNaN(d.getTime()) ? null : d; };
const ym = r => { const d = local(r); return d ? `${d.getFullYear()}-${p2(d.getMonth() + 1)}` : ''; };
const day = r => { const d = local(r); return d ? `${ym(r)}-${p2(d.getDate())}` : ''; };
const stamp = r => { const d = local(r); return d ? `${day(r)} ${p2(d.getHours())}:${p2(d.getMinutes())}` : ''; };
function inPeriod(r, p) {
  if (p.kind === 'all') return true;
  if (p.kind === 'month') return ym(r) === p.ym;
  if (p.kind === 'year') return ym(r).slice(0, 4) === p.y;
  const d = local(r);
  return !!d && d.getTime() >= Date.now() - p.n * 86400000;
}
function periodLabel(p) {
  if (p.kind === 'all') return '전체';
  if (p.kind === 'days') return `최근 ${p.n}일`;
  if (p.kind === 'year') return `${p.y}년`;
  const [y, m] = p.ym.split('-');
  return `${y}년 ${Number(m)}월`;
}
/** 값별 건수 — split 이면 한 칸을 쪼개 세고, prefix 면 'hero:…' 처럼 그 머리만 */
function tally(list, field, split, prefix, rename = v => v) {
  const m = new Map();
  for (const r of list) {
    const raw = (r[field] ?? '').trim();
    let vals = split ? raw.split(split).filter(Boolean) : [raw];
    if (prefix) vals = vals.filter(v => v.startsWith(`${prefix}:`)).map(v => v.slice(prefix.length + 1));
    else if (!vals.length) vals = [''];
    for (const v of vals) { const k = rename(v) || '(없음)'; m.set(k, (m.get(k) ?? 0) + 1); }
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

async function api(path) {
  const res = await fetch(`/api/stats/${path}${path.includes('?') ? '&' : '?'}key=${encodeURIComponent(key)}`);
  if (res.status === 403) { localStorage.removeItem(KEY_STORE); key = ''; throw new Error('열쇠가 맞지 않습니다.'); }
  if (res.status === 503) throw new Error((await res.json()).error || '서버 설정이 빠졌습니다.');
  if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
  return res.json();
}
const rowsOf = async (b, fresh) => (cache[b] && !fresh ? cache[b] : (cache[b] = (await api(`${b}/usage.json`)).rows));

async function unlock(k) {
  key = k;
  $('#gateErr').hidden = true;
  $('#gateBtn').textContent = '확인 중…';
  try {
    await api('check');
    localStorage.setItem(KEY_STORE, k);
    $('#gate').hidden = true;
    $('#main').hidden = false;
    $('#actions').hidden = false;
    route();
  } catch (e) {
    $('#gate').hidden = false;
    $('#main').hidden = true;
    $('#gateErr').textContent = e.message;
    $('#gateErr').hidden = false;
  } finally {
    $('#gateBtn').textContent = '열기';
  }
}

/* 주소 #sales · #bf · #christmas 로 바로 들어간다 (뒤로 가기 됨) */
function route() {
  const b = location.hash.slice(1);
  if (BUILDERS[b]) {
    if (view.builder !== b) view = { builder: b, tab: BUILDERS[b].tabs?.[0][0] ?? null, period: { kind: 'all' } };
    void renderBuilder();
  } else { view.builder = null; void renderHome(); }
}

async function renderHome() {
  $('#csv').hidden = true;
  $('#main').innerHTML = `<p class="card-title" style="margin:0">빌더를 고르세요</p>
    <div class="picks">${Object.entries(BUILDERS).map(([b, c]) => `
      <a class="card pick" href="#${b}" data-pick="${b}" style="text-decoration:none">
        <div class="pick-thumb"><img src="${c.thumb}" alt="" loading="lazy" draggable="false" /></div><h3>${esc(c.name)}</h3>
        <span class="muted">다운로드</span><span class="num" data-num>…</span><dl data-dl></dl></a>`).join('')}
    </div>`;
  await Promise.all(Object.entries(BUILDERS).map(async ([b, c]) => {
    const el = $(`[data-pick="${b}"]`);
    try {
      const rows = await rowsOf(b);
      const last = rows.map(local).filter(Boolean).sort((x, y) => y - x)[0];
      const recent = rows.filter(r => inPeriod(r, { kind: 'days', n: 30 })).length;
      el.querySelector('[data-num]').textContent = rows.length;
      el.querySelector('[data-dl]').innerHTML = `<dt>최근 30일</dt><dd>${recent}</dd>
        <dt>${esc(c.filesLabel)}</dt><dd>${rows.reduce((a, r) => a + (Number(r[c.files]) || 0), 0)}</dd>
        <dt>마지막 사용</dt><dd>${last ? stamp({ time: last.toISOString() }) : '—'}</dd>`;
    } catch (e) {
      el.querySelector('[data-num]').textContent = '—';
      el.querySelector('[data-dl]').innerHTML = `<dt>오류</dt><dd class="err">${esc(e.message)}</dd>`;
    }
  }));
}

const bars = (title, data, total) => `
  <div class="card"><p class="card-title">${esc(title)}</p>
    ${data.length ? data.slice(0, 12).map(([k, n]) => `
      <div class="bar-row"><span title="${esc(k)}">${esc(k)}</span><div class="bar"><i style="width:${total ? (n / total) * 100 : 0}%"></i></div><span>${n}</span></div>`).join('')
    : '<p class="muted">기록 없음</p>'}
  </div>`;

async function renderBuilder(fresh = false) {
  const b = view.builder, c = BUILDERS[b];
  $('#csv').hidden = false;
  $('#csv').href = `/api/stats/${b}/usage.csv?key=${encodeURIComponent(key)}&tz=${encodeURIComponent(TZ)}`;
  if (!cache[b] || fresh) $('#main').innerHTML = `<a class="chip back" href="#">← 빌더 목록</a><p class="muted">불러오는 중… (빌더 서버가 잠들어 있으면 조금 걸립니다)</p>`;
  let all;
  try { all = await rowsOf(b, fresh); } catch (e) { $('#main').innerHTML = `<a class="chip back" href="#">← 빌더 목록</a><p class="err">${esc(e.message)}</p>`; return; }
  if (view.builder !== b) return;
  if (view.tab) all = all.filter(r => r.builder === view.tab);

  const mm = new Map();
  for (const r of all) { const k = ym(r); if (!k) continue; const v = mm.get(k) ?? { count: 0, files: 0 }; v.count++; v.files += Number(r[c.files]) || 0; mm.set(k, v); }
  const months = [...mm.entries()].sort((a, b2) => a[0].localeCompare(b2[0]));
  const years = [...new Set(months.map(([k]) => k.slice(0, 4)))].sort().reverse();
  const max = Math.max(1, ...months.map(([, v]) => v.count));
  const { period } = view;
  const shown = all.filter(r => inPeriod(r, period));
  const total = shown.length;
  const files = shown.reduce((a, r) => a + (Number(r[c.files]) || 0), 0);
  const days = new Set(shown.map(day)).size;
  const chips = [{ kind: 'all' }, { kind: 'days', n: 30 }, { kind: 'days', n: 90 }, ...years.map(y => ({ kind: 'year', y }))];
  const same = (a, b2) => JSON.stringify(a) === JSON.stringify(b2);
  const cols = [['시각', r => stamp(r)], ['지역', r => r.region], ['국가', r => r.country], ...c.cols(view.tab)];

  $('#main').innerHTML = `
    <a class="chip back" href="#">← 빌더 목록</a>
    <p class="card-title" style="margin:0;font-size:20px">${esc(c.name)}</p>
    ${c.tabs ? `<div class="tabs">${c.tabs.map(([k, l]) => `<button type="button" class="tab${view.tab === k ? ' on' : ''}" data-tab="${k}">${esc(l)}</button>`).join('')}</div>` : ''}
    <div class="chips">
      ${chips.map(p => `<button type="button" class="chip${same(p, period) ? ' on' : ''}" data-period='${JSON.stringify(p)}'>${periodLabel(p)}</button>`).join('')}
      ${period.kind === 'month' ? `<span class="chip on">${periodLabel(period)}</span>` : ''}
    </div>
    <div class="kpis">
      ${[['다운로드 횟수', total], [c.filesLabel, files], ['사용한 날', days]].map(([k, v]) => `
        <div class="card kpi"><span class="muted">${k} · ${periodLabel(period)}</span><b>${v}</b></div>`).join('')}
    </div>
    <div class="card">
      <p class="card-title" style="display:flex;justify-content:space-between">월별 다운로드 <span class="muted">막대를 누르면 그 달만 봅니다 · 이 표는 항상 전체 기간</span></p>
      ${months.length ? `<div class="months">${months.map(([k, v]) => `
        <button type="button" class="month${period.kind === 'month' && period.ym === k ? ' on' : ''}" data-month="${k}" title="${k} · 다운로드 ${v.count}회 · ${esc(c.filesLabel)} ${v.files}">
          <em>${v.count}</em><i style="height:${(v.count / max) * 100}%"></i><em>${Number(k.slice(5))}월</em>
        </button>`).join('')}</div>` : '<p class="muted">기록 없음</p>'}
    </div>
    <div class="grid2">${c.bars(view.tab).map(([t, f, sp, pre, rn]) => bars(t, tally(shown, f, sp, pre, rn), total)).join('')}</div>
    <div class="card">
      <p class="card-title">최근 기록 <span class="muted">· ${periodLabel(period)} ${shown.length}건 · 시각은 ${esc(TZ)} 기준</span></p>
      <div style="overflow-x:auto"><table>
        <thead><tr>${[...cols, ['결과'], ...(c.tail ?? [])].map(([h]) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${[...shown].reverse().slice(0, 50).map(r => `<tr>
          ${cols.map(([, f]) => `<td title="${esc(f(r))}">${esc(f(r))}</td>`).join('')}
          <td>${r.output ? `<button type="button" data-view="${esc(r.output)}">보기</button>` : '<span class="muted">—</span>'}</td>
          ${(c.tail ?? []).map(([, f]) => `<td title="${esc(f(r))}">${esc(f(r))}</td>`).join('')}
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
}

/* 결과 보기 — 파일별 썸네일(긴 변 600px). 파일 이름 앞부분(채널·기기)으로 묶는다 */
async function showOutput(id) {
  const b = view.builder;
  const r = cache[b].find(x => x.output === id);
  const src = n => `/api/stats/${b}/output/file?id=${encodeURIComponent(id)}&name=${encodeURIComponent(n)}&key=${encodeURIComponent(key)}`;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-box">
    <div class="modal-head"><div><p class="card-title" style="margin:0">결과 보기</p>
      <p class="muted" style="margin:4px 0 0">${esc(BUILDERS[b].name)} · ${esc(stamp(r))} · ${esc(r.country)} · 썸네일(긴 변 600px, 영상 제외)</p></div>
      <button type="button" class="chip" data-close>닫기</button></div>
    <div data-body><p class="muted">불러오는 중…</p></div></div>`;
  document.body.append(modal);
  const close = () => { modal.remove(); window.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') { const z = document.querySelector('.zoom'); z ? z.remove() : close(); } };
  window.addEventListener('keydown', onKey);
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('[data-close]')) return close();
    const t = e.target.closest('[data-zoom]');
    if (!t) return;
    const z = document.createElement('div');
    z.className = 'zoom';
    z.innerHTML = `<img src="${src(t.dataset.zoom)}" alt="" /><span>${esc(t.dataset.zoom)}</span>`;
    z.addEventListener('click', () => z.remove());
    document.body.append(z);
  });
  try {
    const { files } = await api(`${b}/output?id=${encodeURIComponent(id)}`);
    const groups = new Map();
    for (const f of files) { const g = f.split('-')[0]; groups.set(g, [...(groups.get(g) ?? []), f]); }
    modal.querySelector('[data-body]').innerHTML = files.length
      ? [...groups].map(([g, names]) => `<p style="margin:0;font-weight:600">${esc(g.toUpperCase())} <span class="muted">· ${names.length}장</span></p>
          <div class="thumbs">${names.map(n => `<button type="button" data-zoom="${esc(n)}"><img src="${src(n)}" alt="" loading="lazy" /><small>${esc(n)}</small></button>`).join('')}</div>`).join('')
      : '<p class="muted">저장된 썸네일이 없습니다.</p>';
  } catch (e) {
    modal.querySelector('[data-body]').innerHTML = `<p class="err">${esc(e.message)}</p>`;
  }
}

$('#gateForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#keyInput').value.trim(); if (v) void unlock(v); });
$('#reload').addEventListener('click', () => { if (view.builder) void renderBuilder(true); else { Object.keys(cache).forEach(k => delete cache[k]); void renderHome(); } });
$('#logout').addEventListener('click', () => { localStorage.removeItem(KEY_STORE); location.hash = ''; location.reload(); });
window.addEventListener('hashchange', () => { if (key && $('#gate').hidden) route(); });
$('#main').addEventListener('click', e => {
  const t = e.target.closest('[data-tab]');
  if (t) { view.tab = t.dataset.tab; view.period = { kind: 'all' }; return void renderBuilder(); }
  const c = e.target.closest('[data-period]');
  if (c) { view.period = JSON.parse(c.dataset.period); return void renderBuilder(); }
  const m = e.target.closest('[data-month]');
  if (m) { view.period = view.period.kind === 'month' && view.period.ym === m.dataset.month ? { kind: 'all' } : { kind: 'month', ym: m.dataset.month }; return void renderBuilder(); }
  const v = e.target.closest('[data-view]');
  if (v) void showOutput(v.dataset.view);
});

if (key) void unlock(key);

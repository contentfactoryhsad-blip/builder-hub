// 첫 접속 국가(법인) 선택 팝업 — lg.com Select your region 처럼 지역 아코디언 > 국가.
// 고른 값은 저장하지 않는다 — 새로 들어오거나 새로고침하면 다시 묻는다 (처음에 잘못 고를 수도 있으니).
// 처음에는 고르기 전까지 닫을 수 없고,
// 헤더의 국가 버튼으로 다시 열면 그때는 닫기(×)·바깥 클릭·Esc 로 닫을 수 있다.
// 고른 값은 빌더 카드 링크에 ?hub_country=ASIA/KR 처럼 "지역/국가" 코드로 붙여 넘긴다 — 각 빌더가 받아
// 다운로드 기록(stats)의 country 칸에 그대로 찍는다. 고르기 전에는 카드로 이동할 수 없다.
import { REGIONS } from './regions.js';

// 이번 방문에서 고른 나라 { name, code: 'ASIA/KR' } — 메모리에만 둔다
let picked = null;
const read = () => picked;
const save = (v) => { picked = v; };

const plus = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path class="v" d="M10 2v16"/><path d="M2 10h16"/></svg>';
const close = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>';
const globe = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';

const modal = document.createElement('div');
modal.className = 'cs-overlay';
modal.hidden = true;
modal.innerHTML = `
  <div class="cs-modal" role="dialog" aria-modal="true" aria-labelledby="csTitle">
    <div class="cs-head">
      <div>
        <h2 id="csTitle">Where is your country (subsidiary)?</h2>
        <p>Select your region, then your country.</p>
      </div>
      <button class="cs-close" type="button" aria-label="Close">${close}</button>
    </div>
    <div class="cs-list">
      ${REGIONS.map((r, i) => `
        <section class="cs-region">
          <button class="cs-region-head" type="button" aria-expanded="false" aria-controls="csR${i}">
            <span>${r.name}</span>${plus}
          </button>
          <div class="cs-region-body" id="csR${i}">
            <div class="cs-region-inner">
              <ul class="cs-countries">
                ${r.countries.map(([name, code]) => `<li><button class="cs-country" type="button" data-name="${name}" data-code="${r.code}/${code}">${name}</button></li>`).join('')}
              </ul>
            </div>
          </div>
        </section>`).join('')}
    </div>
  </div>`;
document.body.append(modal);

let required = false;

function open({ force = false } = {}) {
  required = force;
  modal.classList.toggle('required', force);
  const cur = read();
  modal.querySelectorAll('.cs-country').forEach((b) => b.classList.toggle('on', b.dataset.code === cur?.code));
  // 이미 고른 나라가 있으면 그 지역을 펼쳐 둔다
  modal.querySelectorAll('.cs-region').forEach((sec) => setOpen(sec, !!cur && sec.querySelector(`.cs-country.on`) !== null));
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function hide() {
  if (required) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

function setOpen(sec, on) {
  sec.classList.toggle('open', on);
  sec.querySelector('.cs-region-head').setAttribute('aria-expanded', String(on));
}

modal.addEventListener('click', (e) => {
  const head = e.target.closest('.cs-region-head');
  if (head) { const sec = head.parentElement; setOpen(sec, !sec.classList.contains('open')); return; }
  const pick = e.target.closest('.cs-country');
  if (pick) {
    save({ name: pick.dataset.name, code: pick.dataset.code });
    required = false;
    renderBadge();
    linkCards();
    hide();
    return;
  }
  if (e.target === modal || e.target.closest('.cs-close')) hide();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) hide(); });

// 헤더 오른쪽 — 고른 나라 표시 + 다시 고르기
const badge = document.createElement('button');
badge.type = 'button';
badge.className = 'cs-badge';
badge.addEventListener('click', () => open());
document.querySelector('.app-header').append(badge);

function renderBadge() {
  const cur = read();
  badge.hidden = !cur;
  if (cur) badge.innerHTML = `${globe}<span>${cur.name}</span><span class="cs-badge-code">${cur.code}</span>`;
}

// 빌더 카드 링크에 고른 나라를 붙인다 (data-url 이 원래 주소)
function linkCards() {
  const cur = read();
  document.querySelectorAll('.hub-card[data-url]').forEach((a) => {
    const url = new URL(a.dataset.url);
    if (cur) url.searchParams.set('hub_country', cur.code);
    a.href = url.toString();
  });
}

// 나라를 고르기 전에는 카드로 못 간다 — 누르면 팝업을 다시 띄운다 (가운데 클릭·Ctrl 클릭 포함)
const guard = (e) => {
  if (read() || !e.target.closest('.hub-card[data-url]')) return;
  e.preventDefault();
  open({ force: true });
};
document.addEventListener('click', guard);
document.addEventListener('auxclick', guard);

renderBadge();
linkCards();
if (!read()) open({ force: true });

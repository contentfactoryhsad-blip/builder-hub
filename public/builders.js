// 허브 카드 목록 — 빌더가 늘면 여기에 한 줄 추가한다.
// url 은 Railway 각 서비스의 커스텀 도메인 (production).
// type 은 프로모션 구분 (상시 / 빅 / 시즌성) — 카드 이름 위 라벨로 보인다.
// thumb 은 public/thumbs/ 의 대표 이미지 (박스에 꽉 채워 크롭, thumbPos 로 보여줄 위치 지정),
// comingSoon 이면 링크 없이 "Coming soon" 카드로 그린다.
export const PROMO_TYPES = {
  always: 'Always-on Promotion',
  big: 'Big Promotion',
  seasonal: 'Seasonal Promotion',
};

export const BUILDERS = [
  { name: 'Sales Banner Builder', type: 'always', desc: 'Sales promotion banner templates', url: 'https://sales-banner-builder.lge-d2c.com', thumb: 'thumbs/sales.png' },
  { name: 'Black Friday Builder', type: 'big', desc: 'LG Retail content banner for Black Friday', url: 'https://lg-bf-builder.lge-d2c.com', thumb: 'thumbs/black-friday.png' },
  { name: 'Christmas Builder', type: 'seasonal', desc: 'Christmas season visual & banner', url: 'https://christmas-builder.lge-d2c.com', thumb: 'thumbs/christmas.png' },
  { name: 'Trade In-Up Builder', type: 'always', desc: 'Trade-in / trade-up promotion banner', url: 'https://trade-in-up-builder.lge-d2c.com', comingSoon: true },
];

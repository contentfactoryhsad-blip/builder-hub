// 첫 접속 국가(법인) 선택 팝업의 목록 — 지역(아코디언) > 국가. 지역 안에서는 ABC 순.
// 지역 구분은 lg.com Select your region 과 같다 (멕시코는 북미, 파나마는 중미·카리브).
//
// code 는 빌더 stats 에 "지역/국가" 로 찍힌다 (예: ASIA/KR).
// 국가는 ISO 3166 두 글자.
export const REGIONS = [
  {
    name: 'Asia', code: 'ASIA',
    countries: [
      ['Australia', 'AU'], ['China', 'CN'], ['India', 'IN'], ['Indonesia', 'ID'], ['Japan', 'JP'],
      ['Malaysia', 'MY'], ['Philippines', 'PH'], ['Singapore', 'SG'], ['Taiwan', 'TW'], ['Thailand', 'TH'],
      ['Vietnam', 'VN'],
    ],
  },
  {
    name: 'Europe', code: 'EUROPE',
    countries: [
      ['Austria', 'AT'], ['Belgium', 'BE'], ['Czech Republic', 'CZ'], ['Denmark', 'DK'], ['France', 'FR'],
      ['Germany', 'DE'], ['Hungary', 'HU'], ['Italy', 'IT'], ['Netherlands', 'NL'], ['Poland', 'PL'],
      ['Portugal', 'PT'], ['Spain', 'ES'], ['Sweden', 'SE'], ['Switzerland', 'CH'], ['United Kingdom', 'GB'],
    ],
  },
  {
    name: 'Middle East & Africa', code: 'MEA',
    countries: [
      ['Egypt', 'EG'], ['Morocco', 'MA'], ['Saudi Arabia', 'SA'], ['South Africa', 'ZA'], ['Türkiye', 'TR'],
      ['U.A.E', 'AE'],
    ],
  },
  {
    name: 'North America', code: 'N.AMERICA',
    countries: [['Canada', 'CA'], ['Mexico', 'MX'], ['U.S.A', 'US']],
  },
  {
    name: 'Central America and Caribbean', code: 'CAC',
    countries: [['Panama', 'PA']],
  },
  {
    name: 'South America', code: 'S.AMERICA',
    countries: [['Brazil', 'BR'], ['Chile', 'CL'], ['Colombia', 'CO'], ['Peru', 'PE']],
  },
  {
    name: 'CIS', code: 'CIS',
    countries: [['Kazakhstan', 'KZ'], ['Russia', 'RU']],
  },
];

// 첫 접속 국가(법인) 선택 팝업의 목록 — 지역(아코디언) > 국가.
// 임시 목록: lg.com/common/index.jsp 의 Select your region 을 옮겨 왔다. 확정되면 이 파일만 고친다.
//
// code 는 빌더 stats 에 "지역/국가" 로 찍힌다 (예: ASIA/KR).
// 국가는 ISO 3166 두 글자, 여러 나라를 묶은 법인 단위(Gulf 등)는 임시 코드.
export const REGIONS = [
  {
    name: 'Asia', code: 'ASIA',
    countries: [
      ['Australia', 'AU'], ['Bangladesh', 'BD'], ['China', 'CN'], ['Hong Kong', 'HK'], ['India', 'IN'],
      ['Indonesia', 'ID'], ['Japan', 'JP'], ['Korea', 'KR'], ['Malaysia', 'MY'], ['Nepal', 'NP'],
      ['New Zealand', 'NZ'], ['Philippines', 'PH'], ['Singapore', 'SG'], ['Sri Lanka', 'LK'], ['Taiwan', 'TW'],
      ['Thailand', 'TH'], ['Uzbekistan', 'UZ'], ['Vietnam', 'VN'], ['Central Asia', 'CENTRAL-ASIA'], ['Kazakhstan', 'KZ'],
      ['Kyrgyzstan', 'KG'], ['Mongolia', 'MN'], ['Tajikistan', 'TJ'], ['Turkmenistan', 'TM'],
    ],
  },
  {
    name: 'Europe', code: 'EUROPE',
    countries: [
      ['Austria', 'AT'], ['Belgium', 'BE'], ['Bulgaria', 'BG'], ['Croatia', 'HR'], ['Czech Republic', 'CZ'],
      ['Denmark', 'DK'], ['Estonia', 'EE'], ['Finland', 'FI'], ['France', 'FR'], ['Germany', 'DE'],
      ['Greece', 'GR'], ['Hungary', 'HU'], ['Ireland', 'IE'], ['Italy', 'IT'], ['Latvia', 'LV'],
      ['Liechtenstein', 'LI'], ['Lithuania', 'LT'], ['Luxembourg', 'LU'], ['Netherlands', 'NL'], ['Norway', 'NO'],
      ['Poland', 'PL'], ['Portugal', 'PT'], ['Romania', 'RO'], ['Russia', 'RU'], ['Serbia', 'RS'],
      ['Slovakia', 'SK'], ['Spain', 'ES'], ['Sweden', 'SE'], ['Switzerland', 'CH'], ['Türkiye', 'TR'],
      ['Ukraine', 'UA'], ['United Kingdom', 'GB'],
    ],
  },
  {
    name: 'Middle East & Africa', code: 'MEA',
    countries: [
      ['Algeria', 'DZ'], ['Egypt', 'EG'], ['Iran', 'IR'], ['Israel', 'IL'], ['Morocco', 'MA'],
      ['Saudi Arabia', 'SA'], ['South Africa', 'ZA'], ['Tunisia', 'TN'], ['East Africa', 'EAST-AFRICA'], ['Gulf', 'GULF'],
      ['Levant', 'LEVANT'], ['West Africa', 'WEST-AFRICA'], ['Pakistan', 'PK'], ['U.A.E', 'AE'], ['Kenya', 'KE'],
      ['Nigeria', 'NG'], ['Ghana', 'GH'], ['Jordan', 'JO'], ['Lebanon', 'LB'], ['Iraq', 'IQ'],
      ['Kuwait', 'KW'], ['Qatar', 'QA'], ['Oman', 'OM'], ['Bahrain', 'BH'],
    ],
  },
  {
    name: 'North America', code: 'NA',
    countries: [['Canada', 'CA'], ['Mexico', 'MX'], ['U.S.A', 'US']],
  },
  {
    name: 'Central America and Caribbean', code: 'CAC',
    countries: [['Central America and Caribbean', 'CAC'], ['Panama', 'PA']],
  },
  {
    name: 'South America', code: 'SA',
    countries: [
      ['Argentina', 'AR'], ['Brazil', 'BR'], ['Chile', 'CL'], ['Colombia', 'CO'], ['Ecuador', 'EC'],
      ['Venezuela', 'VE'], ['Bolivia', 'BO'], ['Paraguay', 'PY'], ['Peru', 'PE'], ['Uruguay', 'UY'],
    ],
  },
];
